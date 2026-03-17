"use client";

import { useEffect, useState } from "react";
import { Copy, ExternalLink, Flame, Info, Loader2 } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useNetwork } from "@/components/NetworkProvider";
import { burnTokens } from "@/utils/token";
import { Connection, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";

interface Token {
  mint: string;
  name: string;
  symbol: string;
  supply: string;
  image: string | null;
  network: string;
  createdAt: string;
  decimals?: number;
}

export function TokenCard({ token }: { token: Token }) {
  const { rpcUrl } = useNetwork();
  const wallet = useWallet();
  const { publicKey } = wallet;

  const [balance, setBalance] = useState<string>("Loading...");
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [burnAmount, setBurnAmount] = useState("");
  const [isBurning, setIsBurning] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | "loading" | "idle"; message: string }>({ type: "idle", message: "" });

  useEffect(() => {
    async function fetchBalance() {
      if (!publicKey) return;
      try {
        const connection = new Connection(rpcUrl, "confirmed");
        const mintPubkey = new PublicKey(token.mint);
        const authPubkey = new PublicKey(publicKey.toString());
        const ata = getAssociatedTokenAddressSync(mintPubkey, authPubkey);

        const balResponse = await connection.getTokenAccountBalance(ata);
        setBalance(balResponse.value.uiAmountString || "0");
      } catch (e) {
        setBalance("0 (ATA not found)");
      }
    }

    if (publicKey) fetchBalance();
  }, [publicKey, rpcUrl, token.mint]);

  const handleBurn = async () => {
    if (!publicKey) return;
    const decimals = token.decimals ?? 9; // Fallback for old tokens
    
    if (!burnAmount || parseFloat(burnAmount) <= 0) {
      setStatus({ type: "error", message: "Enter a valid burn amount." });
      return;
    }

    try {
      setIsBurning(true);
      setStatus({ type: "loading", message: "Burning tokens on-chain..." });

      const sig = await burnTokens(
        token.mint,
        parseFloat(burnAmount),
        decimals,
        wallet,
        rpcUrl
      );

      setStatus({ type: "success", message: `Burned! TX: ${sig.slice(0, 8)}...` });
      setBurnAmount("");
      
      // Update Balance after some delay
      setTimeout(() => window.location.reload(), 2000);
    } catch (e: any) {
      setStatus({ type: "error", message: e.message || "Failed to burn tokens." });
    } finally {
      setIsBurning(false);
    }
  };

  const formatImageUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith("ipfs://")) {
      return `https://gateway.pinata.cloud/ipfs/${url.replace("ipfs://", "")}`;
    }
    return url;
  };

  const getExplorerUrl = (address: string, isTx = false) => {
    const baseUrl = "https://solscan.io";
    const path = isTx ? `tx/${address}` : `token/${address}`;
    const cluster = token.network === "devnet" ? "?cluster=devnet" : "";
    return `${baseUrl}/${path}${cluster}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-colors group relative">
      <div className="absolute top-4 right-4 text-xs font-bold uppercase tracking-wider bg-slate-950 px-2 py-1 rounded text-slate-400">
        {token.network}
      </div>

      <div className="p-6">
        <div className="w-20 h-20 bg-slate-800 rounded-full mx-auto mb-4 border-2 border-slate-700 shadow-xl overflow-hidden flex items-center justify-center">
          {token.image ? <img src={formatImageUrl(token.image) || ""} alt={token.name} className="w-full h-full object-cover" /> : <div className="text-slate-500 text-3xl font-bold">{token.symbol.charAt(0)}</div>}
        </div>
        <h3 className="text-xl font-bold text-center text-slate-200">{token.name}</h3>
        <p className="text-center text-slate-400 font-medium">{token.symbol}</p>

        <div className="mt-6 space-y-3">
          <div className="bg-slate-950 p-3 rounded-lg flex justify-between items-center text-sm border border-slate-800">
            <span className="text-slate-500">Supply</span>
            <span className="font-medium text-slate-300">{Number(token.supply).toLocaleString()}</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg flex justify-between items-center text-sm border border-slate-800 group/mint">
            <span className="text-slate-500 w-12">Mint</span>
            <div className="flex items-center gap-2 flex-1 justify-end truncate">
              <span className="font-mono text-purple-400 truncate max-w-[120px]" title={token.mint}>{token.mint}</span>
              <button onClick={() => copyToClipboard(token.mint)} className="text-slate-500 hover:text-white transition-colors">
                <Copy size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <a 
            href={getExplorerUrl(token.mint)} 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl transition-colors text-xs font-medium"
          >
            Explorer <ExternalLink size={14} />
          </a>
          <button 
            onClick={() => setIsManageOpen(!isManageOpen)}
            className="flex items-center justify-center gap-2 bg-purple-900/30 border border-purple-500/20 hover:bg-purple-900/50 text-purple-400 py-2.5 rounded-xl transition-colors text-xs font-medium"
          >
            Manage
          </button>
        </div>

        {isManageOpen && (
          <div className="mt-4 pt-4 border-t border-slate-800 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">Your Balance:</span>
              <span className="text-sm font-bold text-slate-200">{balance}</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-400 flex items-center gap-1"><Flame size={14} className="text-red-500" /> Burn Tokens</label>
              </div>
              <div className="flex gap-2">
                <input 
                  type="number"
                  placeholder="Amount"
                  value={burnAmount}
                  onChange={(e) => setBurnAmount(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 outline-none"
                />
                <button 
                  onClick={handleBurn}
                  disabled={isBurning || !parseFloat(burnAmount)}
                  className="bg-red-600 hover:bg-red-500 disabled:opacity-50 font-bold text-white text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                >
                  {isBurning ? <Loader2 size={12} className="animate-spin" /> : <Flame size={12} />} Burn
                </button>
              </div>
            </div>

            {status.type !== "idle" && (
              <div className={`p-2 rounded text-xs ${status.type === "error" ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                {status.message}
              </div>
            )}

            <div className="border-t border-slate-800/50 pt-3 flex flex-col gap-2">
              <a 
                href="https://raydium.io/liquidity/create-pool/" 
                target="_blank" 
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 py-2 rounded-lg transition-colors text-xs font-medium"
              >
                Create / Manage LP <ExternalLink size={14} />
              </a>
              <div className="flex items-start gap-1 text-[10px] text-slate-500">
                <Info size={12} className="flex-shrink-0 mt-0.5" />
                <p>To remove liquidity, use the link above to manage your LP position directly on Raydium.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
