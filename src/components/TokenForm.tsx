"use client";

import { useState, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useNetwork } from "./NetworkProvider";
import { Upload, Coins, ShieldCheck, Zap, Info, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { createToken } from "@/utils/token";

export function TokenForm() {
  const { publicKey, sendTransaction, signTransaction, signAllTransactions } = useWallet();
  const { networkType } = useNetwork();
  
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [decimals, setDecimals] = useState("9");
  const [supply, setSupply] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [revokeMint, setRevokeMint] = useState(false);
  const [revokeFreeze, setRevokeFreeze] = useState(false);
  
  const [status, setStatus] = useState<"idle" | "uploading" | "creating" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [txSignature, setTxSignature] = useState("");
  const [mintAddress, setMintAddress] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey || !signTransaction || !signAllTransactions) {
      setStatus("error");
      setMessage("Please connect your wallet first.");
      return;
    }
    
    if (!image) {
      setStatus("error");
      setMessage("Please upload an image for your token.");
      return;
    }

    try {
      setStatus("uploading");
      setMessage("Uploading metadata to IPFS via Pinata...");
      
      const formData = new FormData();
      formData.append("file", image);
      formData.append("name", name);
      formData.append("symbol", symbol);
      formData.append("description", description);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Failed to upload metadata");
      const { metadataUri, imageGatewayUri } = await uploadRes.json();

      setStatus("creating");
      setMessage("Requesting payment and creating token...");

      const result = await createToken({
        name,
        symbol,
        uri: metadataUri,
        decimals: parseInt(decimals),
        supply: parseFloat(supply),
        revokeMint,
        revokeFreeze,
        wallet: { publicKey, sendTransaction, signTransaction, signAllTransactions },
        networkType,
      });

      setStatus("success");
      setMessage("Token created successfully!");
      setTxSignature(result.signature);
      setMintAddress(result.mint);
      
      // Save to local storage for dashboard
      try {
        const savedTokens = JSON.parse(localStorage.getItem("weMakeTokens") || "[]");
        savedTokens.push({
          mint: result.mint,
          name,
          symbol,
          supply,
          decimals: parseInt(decimals),
          image: imageGatewayUri || imagePreview,
          network: networkType,
          createdAt: new Date().toISOString()
        });
        localStorage.setItem("weMakeTokens", JSON.stringify(savedTokens));
      } catch (storageErr) {
        console.warn("localStorage quota exceeded, skipping fallback save:", storageErr);
      }
      
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setMessage(err.message || "An error occurred during token creation.");
    }
  };

  const getExplorerUrl = (address: string, isTx = false) => {
    const baseUrl = "https://solscan.io";
    const path = isTx ? `tx/${address}` : `token/${address}`;
    const cluster = networkType === "devnet" ? "?cluster=devnet" : "";
    return `${baseUrl}/${path}${cluster}`;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
            
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Zap className="text-purple-400" /> Token Details
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Token Name *</label>
                  <input 
                    required 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Solana" 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Symbol *</label>
                  <input 
                    required 
                    type="text" 
                    value={symbol} 
                    onChange={(e) => setSymbol(e.target.value)}
                    placeholder="e.g. SOL" 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Decimals (0-9) *</label>
                  <input 
                    required 
                    type="number" 
                    min="0" max="9"
                    value={decimals} 
                    onChange={(e) => setDecimals(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Total Supply *</label>
                  <input 
                    required 
                    type="number" 
                    min="1"
                    value={supply} 
                    onChange={(e) => setSupply(e.target.value)}
                    placeholder="e.g. 1000000" 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex justify-between">
                  <span>Description *</span>
                  <span className="text-slate-500 text-xs">{description.length}/1000</span>
                </label>
                <textarea 
                  required 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your token..." 
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 outline-none focus:border-purple-500 transition-colors resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Token Logo *</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-slate-700 hover:border-purple-500 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors group bg-slate-950/50"
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageChange} 
                    accept="image/*" 
                    className="hidden" 
                  />
                  {imagePreview ? (
                    <div className="flex flex-col items-center">
                      <img src={imagePreview} alt="Preview" className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-slate-800 shadow-lg" />
                      <span className="text-sm text-purple-400 group-hover:text-purple-300">Click to change image</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-slate-400 group-hover:text-slate-300">
                      <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Upload size={24} />
                      </div>
                      <p className="font-medium">Click to upload or drag and drop</p>
                      <p className="text-xs text-slate-500 mt-1">PNG, JPG, WEBP up to 5MB</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <ShieldCheck className="text-pink-400" size={20} /> Authority Controls
                </h3>
                
                <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-800 bg-slate-950 hover:border-slate-700 transition-colors cursor-pointer relative overflow-hidden group">
                  <div className={"flex-shrink-0 w-6 h-6 rounded border flex items-center justify-center " + (revokeMint ? "bg-purple-500 border-purple-500" : "border-slate-600 group-hover:border-purple-400")}>
                    {revokeMint && <CheckCircle2 size={16} className="text-white" />}
                  </div>
                  <input type="checkbox" checked={revokeMint} onChange={(e) => setRevokeMint(e.target.checked)} className="hidden" />
                  <div className="flex-1">
                    <p className="font-medium text-sm text-slate-200">Revoke Mint Authority</p>
                    <p className="text-xs text-slate-400 mt-1">Prevents any more tokens from ever being minted. This builds trust with investors.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-800 bg-slate-950 hover:border-slate-700 transition-colors cursor-pointer relative overflow-hidden group">
                  <div className={"flex-shrink-0 w-6 h-6 rounded border flex items-center justify-center " + (revokeFreeze ? "bg-purple-500 border-purple-500" : "border-slate-600 group-hover:border-purple-400")}>
                    {revokeFreeze && <CheckCircle2 size={16} className="text-white" />}
                  </div>
                  <input type="checkbox" checked={revokeFreeze} onChange={(e) => setRevokeFreeze(e.target.checked)} className="hidden" />
                  <div className="flex-1">
                    <p className="font-medium text-sm text-slate-200">Revoke Freeze Authority</p>
                    <p className="text-xs text-slate-400 mt-1">Prevents the ability to freeze token accounts. Essential for creating liquidity pools.</p>
                  </div>
                </label>
              </div>

              <div className="pt-6">
                <button 
                  type="submit" 
                  disabled={status === "uploading" || status === "creating" || !publicKey}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {status === "uploading" ? (
                    <><Loader2 className="animate-spin" /> Uploading to IPFS...</>
                  ) : status === "creating" ? (
                    <><Loader2 className="animate-spin" /> Creating Token...</>
                  ) : !publicKey ? (
                    <>Connect Wallet to Create</>
                  ) : (
                    <>Create Token <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl sticky top-24">
            <h3 className="text-lg font-bold mb-4 border-b border-slate-800 pb-4">Summary</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Creation Fee</span>
                <span className="font-medium flex items-center gap-1 text-slate-200"><Coins size={14} className="text-yellow-500" /> 0.05 SOL</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Network</span>
                <span className="font-medium bg-slate-800 px-2 py-1 rounded text-purple-300">{networkType === "devnet" ? "Devnet" : "Mainnet Beta"}</span>
              </div>
              
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 mt-4">
                <h4 className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">Token Preview</h4>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex-shrink-0 overflow-hidden border border-slate-700">
                    {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" alt="logo" /> : null}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold text-slate-200 truncate">{name || "Token Name"}</p>
                    <p className="text-sm text-slate-400">{symbol || "SYMBOL"}</p>
                  </div>
                </div>
                <div className="mt-3 text-xs text-slate-500 flex justify-between">
                  <span>Supply: {supply || "0"}</span>
                  <span>Decimals: {decimals}</span>
                </div>
              </div>

              {status !== "idle" && (
                <div className={`p-4 rounded-xl border mt-4 ${
                  status === "error" ? "bg-red-500/10 border-red-500/20 text-red-400" :
                  status === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                  "bg-blue-500/10 border-blue-500/20 text-blue-400"
                }`}>
                  <div className="flex gap-2 text-sm">
                    {status === "error" && <AlertCircle size={18} className="flex-shrink-0" />}
                    {status === "success" && <CheckCircle2 size={18} className="flex-shrink-0" />}
                    {(status === "uploading" || status === "creating") && <Loader2 size={18} className="animate-spin flex-shrink-0" />}
                    <span className="flex-1 break-words">{message}</span>
                  </div>
                  
                  {status === "success" && mintAddress && (
                    <div className="mt-4 space-y-2 text-xs">
                      <div className="bg-slate-950 p-2 rounded border border-emerald-500/20 flex justify-between items-center">
                        <span className="text-slate-400">Mint Address:</span>
                        <a href={getExplorerUrl(mintAddress)} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline truncate ml-2 max-w-[150px]">
                          {mintAddress.slice(0, 4)}...{mintAddress.slice(-4)}
                        </a>
                      </div>
                      <div className="bg-slate-950 p-2 rounded border border-emerald-500/20 flex justify-between items-center">
                        <span className="text-slate-400">Transaction:</span>
                        <a href={getExplorerUrl(txSignature, true)} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline truncate ml-2 max-w-[150px]">
                          {txSignature.slice(0, 4)}...{txSignature.slice(-4)}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3 text-sm text-blue-200 mt-4">
                <Info size={18} className="text-blue-400 flex-shrink-0 mt-0.5" />
                <p>Ensure your wallet has enough SOL to cover the Solana rent fees plus the 0.05 SOL creation fee.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
