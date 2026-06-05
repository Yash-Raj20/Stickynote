import Link from 'next/link';
import { ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#FEC700]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#02462E]/30 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e108_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e108_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Floating 404 Note */}
      <div className="relative z-10 mb-12 animate-[bounce_4s_infinite]">
        <div className="w-64 h-64 bg-gradient-to-br from-[#FEC700] to-[#e5b300] rounded-xl shadow-2xl p-8 rotate-3 border border-[#fef08a]/50 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-6 bg-[#fef08a]/50 shadow-sm backdrop-blur-sm transform -rotate-2" />
          <h1 className="text-8xl font-black text-slate-900 mt-4 tracking-tighter opacity-80">404</h1>
          <div className="w-3/4 h-2 bg-slate-900/20 rounded mt-6" />
          <div className="w-full h-2 bg-slate-900/20 rounded mt-4" />
          <div className="w-5/6 h-2 bg-slate-900/20 rounded mt-4" />
        </div>
      </div>

      <div className="text-center relative z-10 max-w-lg mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
          Lost in the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FEC700] to-emerald-400">canvas?</span>
        </h2>
        <p className="text-lg text-slate-400 mb-10 leading-relaxed">
          The sticky note you're looking for seems to have flown away or was never created. Don't worry, you can easily find your way back.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/" className="flex items-center justify-center gap-2 px-8 py-4 text-base font-bold bg-[#FEC700] text-slate-900 rounded-xl hover:bg-[#e5b300] transition-all duration-200 shadow-[0_0_30px_rgba(254,199,0,0.3)] hover:-translate-y-0.5">
            <Home className="w-5 h-5" />
            Return Home
          </Link>
          <Link href="/board" className="flex items-center justify-center gap-2 px-8 py-4 text-base font-medium text-white bg-[#02462E] rounded-xl hover:bg-[#02462E]/80 transition-all duration-200 border border-[#02462E]/50">
            Go to Dashboard
            <ArrowLeft className="w-5 h-5 rotate-180" />
          </Link>
        </div>
      </div>
    </div>
  );
}
