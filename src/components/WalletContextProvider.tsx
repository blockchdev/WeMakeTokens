"use client";

import { useMemo, useState, useEffect, ReactNode } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter, WalletConnectWalletAdapter } from "@solana/wallet-adapter-wallets";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { useNetwork } from "./NetworkProvider";

import "@solana/wallet-adapter-react-ui/styles.css";

export function WalletContextProvider({ children }: { children: ReactNode }) {
  const { rpcUrl, networkType } = useNetwork();
  
  const network = useMemo(() => {
    if (networkType === "mainnet-beta") return WalletAdapterNetwork.Mainnet;
    return WalletAdapterNetwork.Devnet;
  }, [networkType]);

  const [isTelegram, setIsTelegram] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      setIsTelegram(true);
    }
  }, []);

  const wallets = useMemo(
    () => {
      const connectAdapter = new WalletConnectWalletAdapter({
        network: network,
        options: {
          projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
        },
      });

      if (isTelegram) {
        return [connectAdapter];
      }

      return [
        new PhantomWalletAdapter(),
        new SolflareWalletAdapter(),
        connectAdapter,
      ];
    },
    [network, isTelegram]
  );

  return (
    <ConnectionProvider endpoint={rpcUrl}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
