"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { clusterApiUrl } from "@solana/web3.js";

type NetworkType = "devnet" | "mainnet-beta";

interface NetworkContextType {
  networkType: NetworkType;
  setNetworkType: (networkType: NetworkType) => void;
  rpcUrl: string;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [networkType, setNetworkType] = useState<NetworkType>("devnet");

  const rpcUrl = React.useMemo(() => {
    if (process.env.NEXT_PUBLIC_RPC_URL && networkType === "mainnet-beta") {
      return process.env.NEXT_PUBLIC_RPC_URL;
    }
    return clusterApiUrl(networkType);
  }, [networkType]);

  return (
    <NetworkContext.Provider value={{ networkType, setNetworkType, rpcUrl }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error("useNetwork must be used within a NetworkProvider");
  }
  return context;
}
