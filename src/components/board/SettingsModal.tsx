"use client";

import { useNotesStore } from '@/store/useNotesStore';
import { useAuthStore } from '@/store/useAuthStore';
import { X, Settings as SettingsIcon, Bell, Palette, LayoutGrid, Shield, User, Key, ChevronDown, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import toast from 'react-hot-toast';

// Custom Dropdown Component for a premium look
function CustomSelect({ options, value, onChange }: { options: string[], value: string, onChange: (v: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-40 bg-input-bg border border-border rounded-xl px-4 py-2.5 text-sm text-foreground hover:border-theme-primary/50 transition-colors shadow-sm"
      >
        <span>{value}</span>
        <ChevronDown size={16} className={`text-foreground/50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-surface border border-border rounded-xl shadow-xl z-50 py-1 animate-in fade-in zoom-in-95 duration-100">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setIsOpen(false); }}
              className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-input-bg text-left text-foreground transition-colors"
            >
              <span>{opt}</span>
              {value === opt && <Check size={14} className="text-theme-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Reusable Responsive Settings Row
function SettingsRow({ title, description, isDanger, children }: { title: string, description: string, isDanger?: boolean, children: React.ReactNode }) {
  return (
    <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 border-b gap-4 sm:gap-0 ${isDanger ? 'border-red-500/20' : 'border-border'}`}>
      <div className="w-full sm:w-auto pr-4">
        <h4 className={`font-medium ${isDanger ? 'text-red-500' : 'text-foreground'}`}>{title}</h4>
        <p className="text-sm text-foreground/60">{description}</p>
      </div>
      <div className="w-full flex justify-end sm:w-auto sm:block">
        {children}
      </div>
    </div>
  );
}

// Toggle Switch Component
function Toggle({ checked, onChange }: { checked: boolean, onChange: (c: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-[2px] ${checked ? 'bg-theme-primary' : 'bg-slate-300 dark:bg-slate-700'}`}
    >
      <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}

export default function SettingsModal() {
  const isOpen = useNotesStore(state => state.isSettingsModalOpen);
  const setIsOpen = useNotesStore(state => state.setIsSettingsModalOpen);

  const [activeTab, setActiveTab] = useState('general');

  // State for working settings
  const [language, setLanguage] = useState('Auto-detect');
  const [defaultView, setDefaultView] = useState('My Notes');
  const [emailNotif, setEmailNotif] = useState(true);
  const [desktopNotif, setDesktopNotif] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);

  // Load from local storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('userSettings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.language) setLanguage(parsed.language);
        if (parsed.defaultView) setDefaultView(parsed.defaultView);
        if (parsed.emailNotif !== undefined) setEmailNotif(parsed.emailNotif);
        if (parsed.desktopNotif !== undefined) setDesktopNotif(parsed.desktopNotif);
        if (parsed.twoFactor !== undefined) setTwoFactor(parsed.twoFactor);
      }
    }
  }, []);

  // Save to local storage when changed
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('userSettings', JSON.stringify({
        language, defaultView, emailNotif, desktopNotif, twoFactor
      }));
    }
  }, [language, defaultView, emailNotif, desktopNotif, twoFactor]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-4xl h-[85vh] sm:h-[80vh] bg-surface border border-border shadow-2xl rounded-2xl flex flex-col sm:flex-row overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Desktop Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="hidden sm:block absolute top-4 right-4 p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-foreground/60 transition-colors z-20"
        >
          <X size={20} />
        </button>

        {/* Sidebar Container */}
        <div className="w-full sm:w-64 bg-black/5 dark:bg-white/5 border-b sm:border-r border-border flex flex-col shrink-0">

          {/* Mobile Header (Settings Title + Close Button) */}
          <div className="flex sm:hidden items-center justify-between p-4 pb-2">
            <h2 className="text-xl font-bold text-foreground">Settings</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-foreground/60 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <h2 className="hidden sm:block text-xl font-bold text-foreground mb-6 px-7 pt-6">Settings</h2>

          {/* Scrollable Tabs */}
          <div className="flex flex-row sm:flex-col px-3 sm:px-4 pb-3 sm:pb-4 gap-2 overflow-x-auto custom-scrollbar items-center sm:items-stretch">
            <button onClick={() => setActiveTab('general')} className={`flex items-center gap-2 sm:gap-3 px-3 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${activeTab === 'general' ? 'bg-black/10 dark:bg-white/10 text-foreground' : 'text-foreground/70 hover:bg-black/5 dark:hover:bg-white/5'}`}>
              <SettingsIcon size={16} className="sm:w-[18px] sm:h-[18px]" /> General
            </button>
            <button onClick={() => setActiveTab('appearance')} className={`flex items-center gap-2 sm:gap-3 px-3 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${activeTab === 'appearance' ? 'bg-black/10 dark:bg-white/10 text-foreground' : 'text-foreground/70 hover:bg-black/5 dark:hover:bg-white/5'}`}>
              <Palette size={16} className="sm:w-[18px] sm:h-[18px]" /> Appearance
            </button>
            <button onClick={() => setActiveTab('notifications')} className={`flex items-center gap-2 sm:gap-3 px-3 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${activeTab === 'notifications' ? 'bg-black/10 dark:bg-white/10 text-foreground' : 'text-foreground/70 hover:bg-black/5 dark:hover:bg-white/5'}`}>
              <Bell size={16} className="sm:w-[18px] sm:h-[18px]" /> Notifications
            </button>
            <div className="hidden sm:block h-px bg-border my-2 mx-3 shrink-0" />
            <button onClick={() => setActiveTab('account')} className={`flex items-center gap-2 sm:gap-3 px-3 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${activeTab === 'account' ? 'bg-black/10 dark:bg-white/10 text-foreground' : 'text-foreground/70 hover:bg-black/5 dark:hover:bg-white/5'}`}>
              <User size={16} className="sm:w-[18px] sm:h-[18px]" /> Account
            </button>
            <button onClick={() => setActiveTab('security')} className={`flex items-center gap-2 sm:gap-3 px-3 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${activeTab === 'security' ? 'bg-black/10 dark:bg-white/10 text-foreground' : 'text-foreground/70 hover:bg-black/5 dark:hover:bg-white/5'}`}>
              <Shield size={16} className="sm:w-[18px] sm:h-[18px]" /> Security
            </button>

            {/* Spacer to push signature down on desktop */}
            <div className="hidden sm:block flex-1" />

            <div className="hidden sm:block px-3 pb-2 pt-4">
              <p className="text-[11px] font-medium text-foreground/40 text-center">
                Developed by ❤️ <span className="text-theme-primary font-bold">Ratnesh</span>
              </p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 sm:p-12 pb-24">

          {activeTab === 'general' && (
            <div className="max-w-xl space-y-8 animate-in fade-in duration-300">
              <h3 className="text-2xl font-bold text-foreground">General</h3>
              <div className="space-y-2">
                <SettingsRow title="Language" description="Select the language you mainly speak.">
                  <CustomSelect options={['Auto-detect', 'English', 'Hindi', 'Spanish']} value={language} onChange={setLanguage} />
                </SettingsRow>
                <SettingsRow title="Default View" description="Choose what you see when you log in.">
                  <CustomSelect options={['My Notes', 'Archived', 'Shared with me']} value={defaultView} onChange={setDefaultView} />
                </SettingsRow>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="max-w-xl space-y-8 animate-in fade-in duration-300">
              <h3 className="text-2xl font-bold text-foreground">Appearance</h3>
              <div className="space-y-2">
                <SettingsRow title="Theme" description="Switch between light and dark mode.">
                  <ThemeToggle />
                </SettingsRow>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="max-w-xl space-y-8 animate-in fade-in duration-300">
              <h3 className="text-2xl font-bold text-foreground">Notifications</h3>
              <div className="space-y-2">
                <SettingsRow title="Email Notifications" description="Receive emails when notes are shared with you.">
                  <Toggle checked={emailNotif} onChange={setEmailNotif} />
                </SettingsRow>
                <SettingsRow title="Desktop Notifications" description="Show browser push notifications.">
                  <Toggle checked={desktopNotif} onChange={setDesktopNotif} />
                </SettingsRow>
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="max-w-xl space-y-8 animate-in fade-in duration-300">
              <h3 className="text-2xl font-bold text-foreground">Account</h3>
              <div className="space-y-2">
                <SettingsRow title="Subscription" description="You are currently on the Free plan.">
                  <button className="px-4 py-2 bg-theme-primary/10 text-theme-primary text-sm font-semibold rounded-lg hover:bg-theme-primary hover:text-white transition-colors">Upgrade to Pro</button>
                </SettingsRow>
                <SettingsRow title="Export Data" description="Download a JSON copy of all your notes.">
                  <button onClick={() => toast.success('Export started! Check your downloads.')} className="px-4 py-2 border border-border text-foreground text-sm font-medium rounded-lg hover:bg-input-bg transition-colors">Export JSON</button>
                </SettingsRow>
                <SettingsRow title="Delete Account" description="Permanently delete your account and all data." isDanger>
                  <button onClick={() => toast.error('Are you sure? This action cannot be undone.')} className="px-4 py-2 bg-red-500/10 text-red-500 text-sm font-medium rounded-lg hover:bg-red-500 hover:text-white transition-colors">Delete Account</button>
                </SettingsRow>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="max-w-xl space-y-8 animate-in fade-in duration-300">
              <h3 className="text-2xl font-bold text-foreground">Security</h3>
              <div className="space-y-2">
                <SettingsRow title="Change Password" description="Update your account password securely.">
                  <button onClick={() => toast('Check your email for reset instructions.', { icon: '📧' })} className="px-4 py-2 border border-border text-foreground text-sm font-medium rounded-lg hover:bg-input-bg transition-colors flex items-center gap-2"><Key size={14} /> Change Password</button>
                </SettingsRow>
                <SettingsRow title="Two-Factor Authentication" description="Add an extra layer of security to your account.">
                  <Toggle checked={twoFactor} onChange={setTwoFactor} />
                </SettingsRow>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
