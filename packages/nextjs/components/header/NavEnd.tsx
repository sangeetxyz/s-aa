"use client";

import React from "react";
import { AddressInfoDropdown } from "../scaffold-eth/AddressInfoDropdown";
import { AddressQRCodeModal } from "../scaffold-eth/AddressQRCodeModal";
import { LOGIN_DIALOG_ID, LoginDialog } from "./LoginDialog";
import { useSignerStatus, useUser } from "@alchemy/aa-alchemy/react";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { getBlockExplorerAddressLink } from "~~/utils/scaffold-eth";

export const NavEnd = () => {
  const { isConnected } = useSignerStatus();
  const { targetNetwork } = useTargetNetwork();
  const user = useUser();

  const openModal = () => {
    (document.getElementById(LOGIN_DIALOG_ID) as HTMLDialogElement).showModal();
  };

  if (isConnected || user) {
    return (
      <div className="navbar-end flex-grow mr-4">
        {user && (
          <>
            <AddressInfoDropdown
              address={user.address}
              blockExplorerAddressLink={getBlockExplorerAddressLink(targetNetwork, user.address)}
            />
            <AddressQRCodeModal address={user.address} />
          </>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="navbar-end flex-grow mr-4">
        <div className="btn btn-primary" onClick={openModal}>
          Login
        </div>
      </div>
      <LoginDialog />
    </>
  );
};
