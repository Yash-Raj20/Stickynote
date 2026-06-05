"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Zap, Layers, Share2, Wand2, PlusCircle, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import { useAuthStore } from '@/store/useAuthStore';

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 selection:bg-[#FEC700]/30 overflow-hidden font-sans">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Glow Orbs - Balancing Theme Colors (#FEC700 and #02462E) */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#FEC700]/15 blur-[130px] rounded-full" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-[#02462E]/40 blur-[130px] rounded-full" />
        <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] bg-[#02462E]/30 blur-[130px] rounded-full" />
        
        {/* CSS Grid Pattern - Slate matched */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e110_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e110_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-4 sm:py-6 max-w-7xl mx-auto border-b border-slate-700/50">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
            <Image src="/logo-new.png" alt="Sticky Notes Logo" width={32} height={32} className="object-contain" />
          </div>
          <span className="font-bold text-lg sm:text-xl tracking-tight text-white whitespace-nowrap">Sticky Notes</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-6">
          {mounted && isAuthenticated ? (
            <Link href="/board" className="px-3 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-bold bg-[#FEC700] text-slate-900 rounded-md hover:bg-[#e5b300] transition-colors shadow-lg shadow-[#FEC700]/20 whitespace-nowrap">
              Go to Board
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-xs sm:text-sm font-medium text-slate-300 hover:text-[#FEC700] transition-colors whitespace-nowrap">
                Log in
              </Link>
              <Link href="/register" className="px-3 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-bold bg-[#FEC700] text-slate-900 rounded-md hover:bg-[#e5b300] transition-colors shadow-lg shadow-[#FEC700]/20 whitespace-nowrap">
                Start for free
              </Link>
            </>
          )}
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-24 md:pt-32 pb-24">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">        
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-8 leading-[1.1]">
            Your infinite canvas for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FEC700] via-[#e5b300] to-emerald-400">
              limitless ideas.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl leading-relaxed">
            Brainstorm, plan, and collaborate in real-time. Powered by AI to extract tasks, color-code priorities, and mind-map automatically.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            {mounted && isAuthenticated ? (
              <Link href="/board" className="group flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 text-base font-bold bg-[#FEC700] text-slate-900 rounded-xl hover:bg-[#e5b300] transition-all duration-200 shadow-[0_0_30px_rgba(254,199,0,0.3)] hover:shadow-[0_0_40px_rgba(254,199,0,0.4)] hover:-translate-y-0.5">
                Go to your Board
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <>
                <Link href="/register" className="group flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 text-base font-bold bg-[#FEC700] text-slate-900 rounded-xl hover:bg-[#e5b300] transition-all duration-200 shadow-[0_0_30px_rgba(254,199,0,0.3)] hover:shadow-[0_0_40px_rgba(254,199,0,0.4)] hover:-translate-y-0.5">
                  Start building for free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/login" className="w-full sm:w-auto text-center px-8 py-4 text-base font-medium text-white bg-[#02462E] rounded-xl hover:bg-[#02462E]/80 transition-all duration-200 shadow-lg shadow-[#02462E]/30 border border-[#02462E]/50">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Dashboard Mockup / Visual */}
        <div className="mt-24 relative rounded-2xl border border-slate-700/50 bg-slate-800/30 p-2 backdrop-blur-sm shadow-2xl overflow-hidden aspect-[16/10] md:aspect-video max-w-5xl mx-auto group">
           <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent z-10 pointer-events-none" />
           <div className="w-full h-full rounded-xl bg-slate-900 border border-slate-700/50 overflow-hidden flex flex-col relative transition-transform duration-500 group-hover:scale-[1.01]">
              {/* Mockup Header */}
              <div className="h-10 border-b border-slate-700/50 flex items-center px-4 gap-2 bg-slate-800/80">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
              </div>
              
              {/* Mockup Canvas */}
              <div className="flex-1 relative p-8 bg-[url('/grid.svg')] bg-center overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e108_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e108_1px,transparent_1px)] bg-[size:40px_40px]" />
                
                {/* Simulated Notes */}
                <div className="absolute top-10 left-10 md:top-20 md:left-32 w-48 h-48 md:w-56 md:h-56 bg-gradient-to-br from-[#FEC700]/20 to-[#fef08a]/20 border border-[#FEC700]/30 rounded-xl backdrop-blur-md p-5 rotate-[-2deg] shadow-lg shadow-[#FEC700]/10">
                  <div className="w-2/3 h-3 bg-[#FEC700]/60 rounded mb-5" />
                  <div className="w-full h-2 bg-[#FEC700]/40 rounded mb-3" />
                  <div className="w-full h-2 bg-[#FEC700]/40 rounded mb-3" />
                  <div className="w-4/5 h-2 bg-[#FEC700]/40 rounded" />
                </div>

                {/* Connector Arrow Simulation */}
                <svg className="absolute top-44 left-[280px] w-32 h-20 text-emerald-500/50 z-0 hidden md:block" fill="none" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M 0,0 C 50,0 50,100 100,100" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse" />
                </svg>

                <div className="absolute top-48 left-32 md:top-52 md:left-[450px] w-56 h-56 md:w-64 md:h-64 bg-gradient-to-br from-[#02462E]/50 to-[#059669]/20 border border-[#059669]/40 rounded-xl backdrop-blur-md p-5 rotate-[3deg] shadow-lg shadow-[#02462E]/30 z-10">
                  <div className="w-3/4 h-3 bg-emerald-400/70 rounded mb-6" />
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-4 h-4 rounded border border-emerald-400/50 flex-shrink-0" />
                    <div className="w-3/4 h-2 bg-emerald-400/50 rounded" />
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-4 h-4 rounded border border-emerald-400/50 flex-shrink-0 bg-emerald-400/50" />
                    <div className="w-2/3 h-2 bg-emerald-400/50 rounded" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded border border-emerald-400/50 flex-shrink-0" />
                    <div className="w-1/2 h-2 bg-emerald-400/50 rounded" />
                  </div>
                </div>
              </div>
           </div>
        </div>

        {/* How It Works Section */}
        <div className="mt-40 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">How it works</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">From chaotic thoughts to an organized master plan in three simple steps.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {/* Step 1 */}
            <div className="relative p-8 rounded-2xl bg-slate-800/40 border border-[#FEC700]/20 hover:bg-slate-800/70 transition-all duration-300">
              <div className="absolute -top-5 -left-5 w-12 h-12 bg-slate-900 border border-[#FEC700] rounded-full flex items-center justify-center font-bold text-xl text-[#FEC700] shadow-lg">1</div>
              <PlusCircle className="w-10 h-10 text-[#FEC700] mb-6 opacity-90" />
              <h3 className="text-2xl font-bold mb-3 text-white">Create & Drop</h3>
              <p className="text-slate-400 leading-relaxed text-lg">
                Start an infinite canvas board. Double-click anywhere to drop sticky notes. Add rich text, lists, and ideas freely without worrying about running out of space.
              </p>
            </div>
            {/* Step 2 */}
            <div className="relative p-8 rounded-2xl bg-slate-800/40 border border-[#02462E]/50 hover:bg-slate-800/70 transition-all duration-300">
              <div className="absolute -top-5 -left-5 w-12 h-12 bg-slate-900 border border-emerald-500 rounded-full flex items-center justify-center font-bold text-xl text-emerald-400 shadow-lg">2</div>
              <Share2 className="w-10 h-10 text-emerald-400 mb-6 opacity-90" />
              <h3 className="text-2xl font-bold mb-3 text-white">Connect & Collaborate</h3>
              <p className="text-slate-400 leading-relaxed text-lg">
                Use the connector tool to draw arrows between related notes. Invite your team via email to join in real-time and see their live cursors fly around the screen.
              </p>
            </div>
            {/* Step 3 */}
            <div className="relative p-8 rounded-2xl bg-slate-800/40 border border-[#FEC700]/20 hover:bg-slate-800/70 transition-all duration-300">
              <div className="absolute -top-5 -left-5 w-12 h-12 bg-slate-900 border border-[#FEC700] rounded-full flex items-center justify-center font-bold text-xl text-[#FEC700] shadow-lg">3</div>
              <Wand2 className="w-10 h-10 text-[#FEC700] mb-6 opacity-90" />
              <h3 className="text-2xl font-bold mb-3 text-white">Let AI Organize</h3>
              <p className="text-slate-400 leading-relaxed text-lg">
                Click the AI Sparkle to automatically extract to-do tasks from your paragraphs, color-code notes based on priority, and generate mind-maps instantly.
              </p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-40 relative">
          {/* Subtle background glow for features */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#02462E]/10 blur-[150px] pointer-events-none" />
          
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-16 text-center max-w-2xl mx-auto leading-tight">
            Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FEC700] to-emerald-400">ship faster.</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            <FeatureCard 
              icon={<Zap className="w-6 h-6 text-[#FEC700]" />}
              title="Real-time Engine"
              desc="Powered by WebSockets. See live cursors, active avatars, and changes happen in milliseconds across the globe."
              accentColor="yellow"
            />
            <FeatureCard 
              icon={<Sparkles className="w-6 h-6 text-emerald-400" />}
              title="AI Task Extraction"
              desc="Don't write lists manually. AI reads your long paragraphs and generates clean to-do checklists automatically."
              accentColor="green"
            />
            <FeatureCard 
              icon={<Layers className="w-6 h-6 text-[#FEC700]" />}
              title="Infinite Canvas"
              desc="Never run out of space. Pan, zoom, and organize your ideas on a boundless whiteboard designed for pure creativity."
              accentColor="yellow"
            />
            <FeatureCard 
              icon={<CheckCircle2 className="w-6 h-6 text-emerald-400" />}
              title="Smart Color-Coding"
              desc="AI analyzes the tone and priority of your notes and auto-assigns matching gradient themes (e.g., Red for urgent)."
              accentColor="green"
            />
            <FeatureCard 
              icon={<Share2 className="w-6 h-6 text-[#FEC700]" />}
              title="Secure Sharing"
              desc="Share your boards via email securely. Manage who has access and track all your shared workspaces easily."
              accentColor="yellow"
            />
            <FeatureCard 
              icon={<Wand2 className="w-6 h-6 text-emerald-400" />}
              title="Template Gallery"
              desc="Start instantly with Kanban or Retrospective templates, or save your own custom board layouts for future use."
              accentColor="green"
            />
          </div>
        </div>
        
        {/* Bottom CTA */}
        <div className="mt-40 relative rounded-3xl border border-[#02462E]/50 bg-gradient-to-b from-slate-800/40 via-[#02462E]/20 to-slate-900/80 p-10 md:p-16 text-center overflow-hidden">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[1px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50" />
           <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[#02462E]/20 blur-[100px] rounded-full pointer-events-none" />
           
           <div className="relative z-10 max-w-2xl mx-auto">
             <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white tracking-tight">Ready to bring your ideas to life?</h2>
             <p className="text-slate-300 mb-10 text-lg md:text-xl">Join thousands of teams who are already building the future with our AI-powered whiteboard.</p>
             <Link href={mounted && isAuthenticated ? "/board" : "/register"} className="inline-flex items-center gap-2 px-10 py-5 text-lg font-bold bg-[#FEC700] text-slate-900 rounded-xl hover:bg-[#e5b300] transition-all duration-300 shadow-[0_0_30px_rgba(254,199,0,0.3)] hover:shadow-[0_0_50px_rgba(254,199,0,0.5)] hover:-translate-y-1">
                {mounted && isAuthenticated ? "Open Your Board" : "Get Started for Free"}
                <ArrowRight className="w-6 h-6" />
             </Link>
           </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 mt-20 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded flex items-center justify-center">
              <Image src="/logo-new.png" alt="Sticky Notes Logo" width={32} height={32} className="object-contain" />
            </div>
            <span className="font-semibold text-slate-300 text-lg">Sticky Notes</span>
          </div>
          <div className="flex items-center gap-8 text-sm text-slate-500 font-medium">
            {mounted && isAuthenticated ? (
              <Link href="/board" className="hover:text-[#FEC700] transition-colors">Dashboard</Link>
            ) : (
              <>
                <Link href="/login" className="hover:text-[#FEC700] transition-colors">Log In</Link>
                <Link href="/register" className="hover:text-[#FEC700] transition-colors">Sign Up</Link>
              </>
            )}
            <span>© {new Date().getFullYear()} All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc, accentColor = "yellow" }: { icon: React.ReactNode, title: string, desc: string, accentColor?: "yellow" | "green" }) {
  const isYellow = accentColor === "yellow";
  return (
    <div className={`p-8 rounded-2xl bg-slate-800/30 border ${isYellow ? 'border-slate-700/50 hover:border-[#FEC700]/30' : 'border-slate-700/50 hover:border-[#02462E]/50'} backdrop-blur-sm hover:bg-slate-800/60 transition-all duration-300 hover:-translate-y-1 group`}>
      <div className={`w-14 h-14 rounded-xl bg-slate-900 border ${isYellow ? 'border-slate-700 group-hover:border-[#FEC700]/50' : 'border-slate-700 group-hover:border-[#02462E]/80'} flex items-center justify-center mb-6 shadow-inner shadow-slate-900/50 transition-colors`}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-3 text-white tracking-tight">{title}</h3>
      <p className="text-slate-400 leading-relaxed text-lg">
        {desc}
      </p>
    </div>
  );
}
