import React from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-background">
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
      {/* Left Side: Brand and Decorative Board */}
      <div className="hidden md:flex md:w-1/2 lg:w-[45%] auth-split-left border-r border-border relative flex-col items-center justify-center overflow-hidden">
        
        {/* Brand Header */}
        <div className="absolute top-8 left-8 flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-theme-tertiary flex items-center justify-center text-white font-bold shadow-lg">
            S
          </div>
          <span className="text-2xl font-bold text-theme-primary tracking-tight">StickyNotes</span>
        </div>

        {/* Decorative Sticky Notes matching the user's mockup aesthetic */}
        <div className="relative w-full max-w-sm h-96">
          {/* Yellow Note */}
          <div className="absolute top-0 left-0 w-48 h-48 bg-[#fdf2b3] dark:bg-[#c4b971] rounded shadow-lg transform -rotate-3 p-4 border border-black/5 text-[#333]">
            <p className="font-medium text-sm" style={{ fontFamily: '"Comic Sans MS", "Chalkboard SE", "Marker Felt", sans-serif' }}>
              Don't forget to buy oat milk!
            </p>
          </div>
          
          {/* Blue Note */}
          <div className="absolute top-20 right-4 w-48 h-48 bg-[#a8c6fa] dark:bg-[#5b7fc4] rounded shadow-lg transform rotate-6 p-4 border border-black/5 text-[#333]">
            <p className="font-medium text-sm" style={{ fontFamily: '"Comic Sans MS", "Chalkboard SE", "Marker Felt", sans-serif' }}>
              Meeting at 3 PM.
            </p>
          </div>

          {/* Pink Note */}
          <div className="absolute bottom-4 left-8 w-48 h-48 bg-[#ffcbf2] dark:bg-[#cc8cb9] rounded shadow-lg transform rotate-2 border border-black/5" />
          
          {/* Green Note (Top most) */}
          <div className="absolute top-16 left-12 w-56 h-56 bg-[#c1f5b0] dark:bg-[#86b876] rounded shadow-xl transform -rotate-1 p-5 border border-black/5 text-[#333] z-10">
            <p className="font-medium text-base" style={{ fontFamily: '"Comic Sans MS", "Chalkboard SE", "Marker Felt", sans-serif' }}>
              Organize thoughts. Clarify the UI system.
            </p>
          </div>
        </div>

      </div>

      {/* Right Side: Auth Forms */}
      <div className="w-full md:w-1/2 lg:w-[55%] flex flex-col items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md z-10">
          {children}
        </div>
      </div>
    </div>
  );
}
