"use client";

import { ReactNode } from "react";
import { NetworkProvider } from "./NetworkProvider";
import { WalletContextProvider } from "./WalletContextProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <NetworkProvider>
      <WalletContextProvider>
        {children}
      </WalletContextProvider>
    </NetworkProvider>
  );
}
