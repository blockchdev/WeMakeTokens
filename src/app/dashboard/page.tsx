"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { TokenCard } from "@/components/TokenCard";

interface Token {
  mint: string;
  name: string;
  symbol: string;
  supply: string;
  image: string | null;
  network: string;
  createdAt: string;
}

export default function Dashboard() {
  const [tokens, setTokens] = useState<Token[]>([]);
  
  useEffect(() => {
    const saved = localStorage.getItem("weMakeTokens");
    if (saved) {
      try {
        setTokens(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);



  return (
    <div className="py-12 max-w-6xl mx-auto">
      <div className="mb-10 flex justify-between items-end border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">Your Tokens</h1>
          <p className="text-slate-400 mt-2">Manage and view tokens you've created on this device.</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {tokens.length === 0 ? (
        <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-2xl">
          <p className="text-slate-400 text-lg">You haven't created any tokens yet.</p>
          <a href="/" className="inline-block mt-4 bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg font-medium transition-colors">
            Create Your First Token
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tokens.map((token, i) => (
            <TokenCard key={i} token={token} />
          ))}
        </div>
      )}
    </div>
  );
}
