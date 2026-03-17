"use client";

import { Droplets, ExternalLink, ShieldAlert } from "lucide-react";

export default function LiquidityGuide() {
  return (
    <div className="py-12 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 mb-4 flex items-center justify-center gap-3">
          <Droplets size={40} className="text-blue-400" /> Liquidity Guide
        </h1>
        <p className="text-xl text-slate-400">
          How to make your token tradable by adding a Liquidity Pool (LP) on decentralized exchanges.
        </p>
      </div>

      <div className="space-y-8">
        <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
          <h2 className="text-2xl font-bold mb-4 text-white">1. Create an OpenBook Market</h2>
          <p className="text-slate-300 mb-6">Before creating a liquidity pool on Solana, you need an OpenBook market ID. This acts as the order book for your token pairing (usually YourToken/SOL).</p>
          
          <div className="bg-slate-950 p-4 border border-slate-800 rounded-xl mb-6">
            <h3 className="font-bold text-slate-200 mb-2">Steps:</h3>
            <ol className="list-decimal list-inside space-y-2 text-slate-400">
              <li>Go to Raydium Market Creator or a similar tool.</li>
              <li>Enter your token's Mint Address (found in your dashboard) as the Base Token.</li>
              <li>Use Wrapped SOL (So11111111111111111111111111111111111111112) as the Quote Token.</li>
              <li>Configure tick sizes (usually 0.000001 for meme coins).</li>
              <li>Pay the market creation fee (~0.4 to 2.8 SOL depending on size).</li>
              <li>Save your generated Market ID.</li>
            </ol>
          </div>
          <a href="https://raydium.io/create-market/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium z-10 relative">
            Go to Raydium <ExternalLink size={16} />
          </a>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-cyan-500"></div>
          <h2 className="text-2xl font-bold mb-4 text-white">2. Add Liquidity (Create Pool)</h2>
          <p className="text-slate-300 mb-6">Now you will deposit your tokens and some SOL to set the initial price and allow others to buy/sell.</p>
          
          <div className="bg-slate-950 p-4 border border-slate-800 rounded-xl mb-6">
            <h3 className="font-bold text-slate-200 mb-2">Steps:</h3>
            <ol className="list-decimal list-inside space-y-2 text-slate-400">
              <li>Go to Raydium Liquidity Pool Creator.</li>
              <li>Enter the Market ID you just generated.</li>
              <li>Input the amount of your tokens and the amount of SOL you want to deposit. 
                <span className="block ml-6 mt-1 text-sm text-slate-500 border-l-2 border-slate-700 pl-3">Example: 100,000,000 Tokens & 10 SOL = Price is 10/100,000,000 SOL per token.</span>
              </li>
              <li>Set the launch date (leave blank for immediate).</li>
              <li>Click &quot;Initialize Liquidity Pool&quot; and approve the transaction.</li>
            </ol>
          </div>
          <a href="https://raydium.io/liquidity/create-pool/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-medium z-10 relative">
            Create Liquidity Pool on Raydium <ExternalLink size={16} />
          </a>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-green-500"></div>
          <h2 className="text-2xl font-bold mb-4 text-white">3. Burn or Lock LP Tokens</h2>
          <p className="text-slate-300 mb-6">When you create a pool, you receive &quot;LP Tokens&quot; representing your ownership of the pool. To build trust with investors, you should burn these or lock them.</p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-slate-950 p-5 border border-slate-800 rounded-xl">
              <h3 className="font-bold text-red-400 flex items-center gap-2 mb-2">🔥 Burn (Permanent)</h3>
              <p className="text-sm text-slate-400">Send your LP tokens to the `incinerator` address. You can never withdraw the initial liquidity. This gives investors maximum confidence.</p>
            </div>
            <div className="bg-slate-950 p-5 border border-slate-800 rounded-xl">
              <h3 className="font-bold text-blue-400 flex items-center gap-2 mb-2">🔒 Lock (Temporary)</h3>
              <p className="text-sm text-slate-400">Use a service like Streamflow or Pinksale to lock your LP tokens for 6-12 months. This proves you won't pull the liquidity immediately.</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/30 p-6 rounded-2xl flex items-start gap-4 text-yellow-200">
          <ShieldAlert className="flex-shrink-0 text-yellow-500 mt-1" size={24} />
          <div>
            <h3 className="font-bold text-lg text-yellow-500 mb-2">Important Security Checks</h3>
            <p className="mb-2">Before creating a liquidity pool, make sure you have used the Authority Controls in our dashboard:</p>
            <ul className="list-disc list-inside space-y-1 text-yellow-400/80 text-sm">
              <li><strong>Revoked Mint Authority:</strong> Investors know you can't create more tokens to dump.</li>
              <li><strong>Revoked Freeze Authority:</strong> Mandatory for Raydium. If freeze authority is active, liquidity pool creation will fail.</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
