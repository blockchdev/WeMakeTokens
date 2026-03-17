import { TokenForm } from "@/components/TokenForm";
import { Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="py-12 relative">
      <div className="text-center mb-16 space-y-4 relative z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-purple-600/20 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 px-4 py-2 rounded-full text-sm font-medium">
          <Sparkles size={16} /> <span>Create tokens instantly on Solana</span>
        </div>
        <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-tight">
          Launch Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Solana Token</span>
          <br className="hidden md:block" /> In Seconds
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mt-6">
          No coding required. Just fill the form, pay a tiny 0.05 SOL fee, and deploy your very own SPL token with custom metadata to the blockchain.
        </p>
      </div>

      <div className="relative z-10">
        <TokenForm />
      </div>
    </div>
  );
}
