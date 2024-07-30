"use client";

import React from "react";
import { useSignerStatus } from "@alchemy/aa-alchemy/react";
import Login from "~~/components/cards/Login";
import { Grid } from "~~/components/cards/Profile";

const Home = () => {
  // loading - waiting for a request to resolve
  // connected - the user signed in with an email tied to a smart account
  // unconnected - we need to provide a login UI for the user to sign in
  const { isInitializing, isAuthenticating, isConnected, status } = useSignerStatus();
  const isLoading = isInitializing || (isAuthenticating && status !== "AWAITING_EMAIL_AUTH");

  return (
    <div className="flex items-center justify-center h-screen">
      {isLoading ? (
        <div>
          <div>loading</div>
        </div>
      ) : isConnected ? ( // modify this line
        <div>
          <div>
            <Grid />
          </div>
        </div>
      ) : (
        <div>
          <div>
            <Login />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
