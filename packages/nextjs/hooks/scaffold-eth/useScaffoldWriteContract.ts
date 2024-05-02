import { useState } from "react";
import { useSendUserOperation, useSmartAccountClient } from "@alchemy/aa-alchemy/react";
import { MutateOptions } from "@tanstack/react-query";
import { Abi, ExtractAbiFunctionNames } from "abitype";
import { Hex, encodeFunctionData } from "viem";
import { Config, UseWriteContractParameters, useWriteContract } from "wagmi";
import { WriteContractErrorType, WriteContractReturnType } from "wagmi/actions";
import { WriteContractVariables } from "wagmi/query";
import { useDeployedContractInfo, useTransactor } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import {
  ContractAbi,
  ContractName,
  ScaffoldWriteContractOptions,
  ScaffoldWriteContractVariables,
} from "~~/utils/scaffold-eth/contract";

const policyId = process.env.NEXT_PUBLIC_ALCHEMY_GAS_MANAGER_POLICY_ID;

/**
 * Wrapper around wagmi's useWriteContract hook which automatically loads (by name) the contract ABI and address from
 * the contracts present in deployedContracts.ts & externalContracts.ts corresponding to targetNetworks configured in scaffold.config.ts
 * @param contractName - name of the contract to be written to
 * @param writeContractParams - wagmi's useWriteContract parameters
 */
export const useScaffoldEncodeFunctionCalldata = <TContractName extends ContractName>(
  contractName: TContractName,
  writeContractParams?: UseWriteContractParameters,
) => {
  if (!policyId) {
    throw new Error("gas policy not set!");
  }

  const { client } = useSmartAccountClient({
    type: "MultiOwnerModularAccount",
    gasManagerConfig: {
      policyId,
    },
    opts: {
      txMaxRetries: 20,
    },
  });
  const { sendUserOperationAsync } = useSendUserOperation({ client });

  const writeTx = useTransactor({ client });
  const [isMining, setIsMining] = useState(false);

  const wagmiContractWrite = useWriteContract(writeContractParams);

  const { data: deployedContractData } = useDeployedContractInfo(contractName);

  const sendContractWriteAsyncTx = async <
    TFunctionName extends ExtractAbiFunctionNames<ContractAbi<TContractName>, "nonpayable" | "payable">,
  >(
    functionName: TFunctionName,
    args: readonly unknown[] | undefined,
    variables: ScaffoldWriteContractVariables<TContractName, TFunctionName>,
    options?: ScaffoldWriteContractOptions,
  ) => {
    if (!client) {
      notification.error("SmartAccountClient not defined!");
      return;
    }

    if (!deployedContractData) {
      notification.error("Target Contract is not deployed, did you forget to run `yarn deploy`?");
      return;
    }

    try {
      setIsMining(true);
      const { blockConfirmations, onBlockConfirmation, ...mutateOptions } = options || {};

      const makeWriteWithParams: () => Promise<Hex> = async () => {
        const data = encodeFunctionData({
          abi: deployedContractData.abi as Abi,
          functionName: functionName as string,
          args,
        });
        const uo = await sendUserOperationAsync({
          uo: {
            target: deployedContractData.address,
            value: BigInt(variables.value || 0),
            data,
          },
          ...mutateOptions,
        });
        return client.waitForUserOperationTransaction(uo);
      };
      const writeTxResult = await writeTx(makeWriteWithParams, { blockConfirmations, onBlockConfirmation });

      return writeTxResult;
    } catch (e: any) {
      throw e;
    } finally {
      setIsMining(false);
    }
  };

  const sendContractWriteTx = <
    TContractName extends ContractName,
    TFunctionName extends ExtractAbiFunctionNames<ContractAbi<TContractName>, "nonpayable" | "payable">,
  >(
    variables: ScaffoldWriteContractVariables<TContractName, TFunctionName>,
    options?: Omit<ScaffoldWriteContractOptions, "onBlockConfirmation" | "blockConfirmations">,
  ) => {
    if (!deployedContractData) {
      notification.error("Target Contract is not deployed, did you forget to run `yarn deploy`?");
      return;
    }

    wagmiContractWrite.writeContract(
      {
        abi: deployedContractData.abi as Abi,
        address: deployedContractData.address,
        ...variables,
      } as WriteContractVariables<Abi, string, any[], Config, number>,
      options as
        | MutateOptions<
            WriteContractReturnType,
            WriteContractErrorType,
            WriteContractVariables<Abi, string, any[], Config, number>,
            unknown
          >
        | undefined,
    );
  };

  return {
    ...wagmiContractWrite,
    isMining,
    // Overwrite wagmi's writeContactAsync
    writeContractAsync: sendContractWriteAsyncTx,
    // Overwrite wagmi's writeContract
    writeContract: sendContractWriteTx,
  };
};
