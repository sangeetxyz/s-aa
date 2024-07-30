"use client";

import Link from "next/link";
import CopyIcon from "../CopyIcon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAccount, useUser } from "@alchemy/aa-alchemy/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FiArrowUpRight } from "react-icons/fi";
import MoonLoader from "react-spinners/MoonLoader";
import { toast } from "sonner";
import { formatEther, isAddress, parseEther } from "viem";
import { z } from "zod";
import { useScaffoldContract, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { getShortenAddress } from "~~/lib/utils";
import { accountType, chain } from "~~/services/web3/wagmiConfig";

export const Grid = () => {
  const mintAmount = 1;
  const user = useUser();
  const { address } = useAccount({ type: accountType });
  const { data: balance, refetch } = useScaffoldReadContract({
    contractName: "AAAuthToken",
    functionName: "balanceOf",
    args: [address],
  });
  const { data: AAAuthToken } = useScaffoldContract({
    contractName: "AAAuthToken",
  });
  const { writeContractAsync, isMining } = useScaffoldWriteContract("AAAuthToken");

  const formSchema = z.object({
    receiver: z.string().refine(isAddress, {
      message: "Invalid address.",
    }),
    amount: z.string().min(1, {
      message: "Amount must be at least 1.",
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      receiver: "0x",
      amount: "0",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (isMining) {
      return toast.error("Transaction is pending");
    }
    if (isNaN(Number(values.amount))) {
      return toast.error("Amount must be a number");
    }
    if (balance === undefined || BigInt(values.amount) > balance) {
      return toast.error("Insufficient balance");
    }
    await writeContractAsync({
      functionName: "transfer",
      args: [values.receiver, parseEther(values.amount)],
    });
    refetch();
    toast.success(`Transferred ${values.amount} tokens`);
  };

  const handleMint = async () => {
    if (isMining) {
      return toast.error("Transaction is pending");
    }
    await writeContractAsync({
      functionName: "mint",
      args: [address, parseEther(mintAmount.toString())],
    });
    refetch();
    toast.success(`Minted ${mintAmount} tokens`);
  };

  return (
    <div className="flex space-x-2">
      <div className="flex flex-col space-y-2 w-80">
        {/* token balance */}
        <Card>
          <CardHeader>
            <CardTitle>Token Balance</CardTitle>
            <CardDescription>Check your token balance</CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            {balance === undefined ? (
              <div className="py-1">
                <MoonLoader size={22} color={"#E2E2E2"} />
              </div>
            ) : (
              <div className="flex space-x-1 items-end">
                <div className="font-bold text-3xl">{formatEther(balance)}</div>
                <div className="text-xs pb-1 text-zinc-400">AAAT</div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              variant={"default"}
              size={"sm"}
              onClick={() => {
                handleMint();
              }}
            >
              {isMining ? (
                <div className="flex items-center space-x-2">
                  <MoonLoader size={12} color={"#09090B"} />
                  <div className="">Minting... </div>
                </div>
              ) : (
                `Mint ${mintAmount} Tokens`
              )}
            </Button>
          </CardFooter>
        </Card>
        {/* account details */}
        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>Check your account info</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-zinc-400">
              This innovative framework integrates{" "}
              <Link href={`${"https://www.erc4337.io/"}`}>
                <span className="text-zinc-50 underline cursor-pointer">ERC-4337</span>{" "}
              </Link>
              account abstraction with{" "}
              <Link href={`${"https://www.erc6900.io/"}`}>
                <span className="text-zinc-50 underline cursor-pointer">ERC-6900</span>{" "}
              </Link>
              modularity, enabling <span className="text-zinc-50">gasless transactions</span> and customizable account
              functionalities. By streamlining blockchain interactions, it enhances{" "}
              <span className="text-zinc-50">user experience</span> and expands dApp engagement possibilities.
            </div>
            {!!address && (
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between space-x-4">
                  <div className="text-sm font-bold">
                    Address: <span className="text-zinc-400 font-normal">{getShortenAddress(address)}</span>
                  </div>
                  <CopyIcon text={address} />
                </div>
                {!!user && !!user.email && (
                  <div className="flex justify-between space-x-4">
                    <div className="text-sm font-bold">
                      Email: <span className="text-zinc-400 font-normal">{user.email}</span>
                    </div>
                    <CopyIcon text={user.email} />
                  </div>
                )}
                {!!user && !!user.email && (
                  <div className="flex justify-between space-x-4">
                    <div className="text-sm font-bold">
                      Chain: <span className="text-zinc-400 font-normal">{chain.name}</span>
                    </div>
                    <CopyIcon text={chain.name} />
                  </div>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Link
              href={`${chain.blockExplorers?.default.url}/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size={"sm"} className="flex items-center space-x-0.5">
                <div>Account Explorer</div>
                <FiArrowUpRight size={16} className="pt-0.5" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
      <div className="flex flex-col space-y-2 w-80">
        {/* transfer token */}
        <Card>
          <CardHeader>
            <CardTitle>Transfer Token</CardTitle>
            <CardDescription>Send your tokens to another account</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="receiver"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recipient</FormLabel>
                      <FormControl>
                        <Input placeholder="0x" {...field} />
                      </FormControl>
                      <FormDescription>Enter the recipient&apos;s address</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input placeholder="0" {...field} />
                      </FormControl>
                      <FormDescription>Enter the token amount</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" size={"sm"}>
                  {isMining ? (
                    <div className="flex items-center space-x-2">
                      <MoonLoader size={12} color={"#09090B"} />
                      <div className="">Transferring...</div>
                    </div>
                  ) : (
                    `Transfer Tokens`
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        {/* smart contract */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Smart Contract</CardTitle>
            <CardDescription>Description of AAAT </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-zinc-400">
              <span className="text-zinc-50">Account Abstracted Auth Token</span> is a simple{" "}
              <Link href={`${"https://docs.openzeppelin.com/contracts/4.x/erc20"}`}>
                <span className="text-zinc-50 underline cursor-pointer">ERC20</span>{" "}
              </Link>
              token with minting and transfer functionality.
            </div>
          </CardContent>
          <CardFooter>
            <Link
              href={`${chain.blockExplorers?.default.url}/address/${AAAuthToken?.address}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size={"sm"} className="flex items-center space-x-0.5">
                <div> Contract Explorer</div>
                <FiArrowUpRight size={16} className="pt-0.5" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
