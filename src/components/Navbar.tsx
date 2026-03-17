"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useNetwork } from "./NetworkProvider";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const WalletMultiButtonDynamic = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

export function Navbar() {
  const { networkType, setNetworkType } = useNetwork();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="border-b border-white/10 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            WeMakeTokens
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Create Token</Link>
            <Link href="/dashboard" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Dashboard</Link>
            <Link href="/liquidity" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Liquidity Guide</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <select 
            value={networkType}
            onChange={(e) => setNetworkType(e.target.value as "devnet" | "mainnet-beta")}
            className="hidden sm:block bg-slate-800 border border-slate-700 text-sm rounded-md px-3 py-2 text-slate-200 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
          >
            <option value="devnet">Devnet</option>
            <option value="mainnet-beta">Mainnet</option>
          </select>
          <div className="hidden sm:block">
            <WalletMultiButtonDynamic />
          </div>
          <button 
            className="md:hidden text-slate-300 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-slate-900 border-b border-white/10 p-4 flex flex-col gap-4 shadow-xl">
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="block text-base font-medium text-slate-300 hover:text-white">Create Token</Link>
          <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="block text-base font-medium text-slate-300 hover:text-white">Dashboard</Link>
          <Link href="/liquidity" onClick={() => setIsMobileMenuOpen(false)} className="block text-base font-medium text-slate-300 hover:text-white">Liquidity Guide</Link>
          
          <div className="flex flex-col gap-3 pt-4 border-t border-slate-800 mt-2">
            <select 
              value={networkType}
              onChange={(e) => setNetworkType(e.target.value as "devnet" | "mainnet-beta")}
              className="bg-slate-800 border border-slate-700 text-sm rounded-md px-3 py-2 text-slate-200 outline-none w-full"
            >
              <option value="devnet">Devnet</option>
              <option value="mainnet-beta">Mainnet</option>
            </select>
            <div className="flex justify-center w-full">
               <WalletMultiButtonDynamic />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
