"use client";

import { useNotesStore } from '@/store/useNotesStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Search, HelpCircle, Settings, Plus, Menu, User, LogOut } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AIMenu from './AIMenu';

export default function Navbar() {
  const addNote = useNotesStore(state => state.addNote);
  const isSidebarOpen = useNotesStore(state => state.isSidebarOpen);
  const setIsSidebarOpen = useNotesStore(state => state.setIsSidebarOpen);
  const setIsSearchOpen = useNotesStore(state => state.setIsSearchOpen);
  const setIsProfileModalOpen = useNotesStore(state => state.setIsProfileModalOpen);
  const setIsSettingsModalOpen = useNotesStore(state => state.setIsSettingsModalOpen);

  const currentUser = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const router = useRouter();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-[70px] border-b border-border bg-surface flex items-center justify-between px-4 sm:px-6 shrink-0 z-40 shadow-sm relative gap-3 sm:gap-4">

      {/* Left: Mobile Menu Toggle & Desktop Actions */}
      <div className="flex items-center gap-3 sm:gap-5 shrink-0">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 -ml-2 rounded-xl text-foreground/60 hover:bg-input-bg transition-colors md:hidden"
        >
          <Menu size={24} />
        </button>

        {/* Brand Logo */}
        <div className="flex items-center gap-1">
          <Image
            src="/logo-new.png"
            alt="Sticky Notes Logo"
            width={40}
            height={40}
            className="h-15 w-15 object-cover shrink-0"
            priority
          />
          <span className="hidden sm:block text-lg sm:text-xl font-black text-theme-primary tracking-tight">StickyNotes</span>
        </div>
      </div>

      {/* Center: Spacer */}
      <div className="flex-1" />

      {/* Right: Tools & Search */}
      <div className="flex items-center justify-end gap-1 sm:gap-3 shrink-0">

        {/* Mobile Search Icon (< lg) */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="w-9 h-9 p-2 rounded-full bg-surface border border-border flex items-center justify-center text-foreground/60 hover:bg-input-bg transition-colors lg:hidden"
        >
          <Search size={22} />
        </button>

        {/* Desktop Search Bar (>= lg) */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="hidden lg:flex items-center w-64 h-11 px-4 rounded-full bg-input-bg hover:bg-input-bg/80 border border-transparent hover:border-border text-foreground/40 transition-all text-sm group mr-2"
        >
          <Search size={18} className="mr-2 group-hover:text-theme-primary transition-colors" />
          <span className="flex-1 text-left">Search notes...</span>
          <div className="flex items-center gap-1 text-[10px] font-bold bg-surface border border-border px-1.5 py-0.5 rounded opacity-50">
            <span>Ctrl</span><span>K</span>
          </div>
        </button>

        <AIMenu />
        <ThemeToggle />

        {/* User Avatar & Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border-2 border-white shadow-sm shrink-0 cursor-pointer ring-1 ring-black/5 block flex items-center justify-center text-slate-500 dark:text-slate-300 font-bold"
          >
            {!isMounted ? (
              <span>U</span>
            ) : currentUser?.avatar ? (
              <img src={currentUser.avatar} alt="User" className="w-full h-full object-cover" />
            ) : (
              <span>{currentUser?.name ? currentUser.name.substring(0, 2).toUpperCase() : 'U'}</span>
            )}
          </button>

          {isProfileOpen && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-surface rounded-xl shadow-xl border border-border py-2 flex flex-col z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2 border-b border-border mb-1">
                <p className="font-semibold text-foreground truncate">{currentUser?.name || 'User'}</p>
                <p className="text-xs text-foreground/50 truncate">{currentUser?.email || ''}</p>
              </div>
              <button onClick={() => { setIsProfileModalOpen(true); setIsProfileOpen(false); }} className="flex items-center gap-3 px-4 py-2.5 hover:bg-input-bg text-sm text-foreground transition-colors w-full text-left">
                <User size={16} className="text-foreground/60" /> Account
              </button>
              <button onClick={() => { setIsSettingsModalOpen(true); setIsProfileOpen(false); }} className="flex items-center gap-3 px-4 py-2.5 hover:bg-input-bg text-sm text-foreground transition-colors w-full text-left">
                <Settings size={16} className="text-foreground/60" /> Settings
              </button>
              <div className="h-px bg-border my-1" />
              <button onClick={() => { logout(); router.push('/login'); }} className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-500/10 text-sm text-red-500 transition-colors w-full text-left">
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
