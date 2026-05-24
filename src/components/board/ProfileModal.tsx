"use client";

import { useNotesStore } from '@/store/useNotesStore';
import { useAuthStore } from '@/store/useAuthStore';
import { X, Camera } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

export default function ProfileModal() {
  const isOpen = useNotesStore(state => state.isProfileModalOpen);
  const setIsOpen = useNotesStore(state => state.setIsProfileModalOpen);
  const user = useAuthStore(state => state.user);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateUser = useAuthStore(state => state.updateUser);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setAvatar(user.avatar || '');
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { default: api } = await import('@/lib/api');
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAvatar(res.data.data.url);
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      const { default: api } = await import('@/lib/api');
      const res = await api.put('/auth/profile', { name, avatar });
      updateUser(res.data.data);
      toast.success('Profile updated');
      setIsOpen(false);
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-surface border border-border shadow-2xl rounded-2xl overflow-hidden flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 pb-2">
          <h2 className="text-xl font-bold text-foreground">Edit profile</h2>
        </div>

        <div className="p-6 flex flex-col items-center gap-6">
          
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className={`w-32 h-32 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center overflow-hidden border-4 border-surface shadow-md ${isUploading ? 'animate-pulse' : ''}`}>
              {avatar ? (
                <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-bold text-slate-500 dark:text-slate-300">
                  {name ? name.substring(0, 2).toUpperCase() : 'U'}
                </span>
              )}
            </div>
            <div className="absolute bottom-0 right-0 p-2 bg-zinc-800 text-white rounded-full border-2 border-surface shadow-sm">
              <Camera size={16} />
            </div>
            <input 
              type="file" 
              className="hidden" 
              accept="image/*" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
            />
          </div>

          <div className="w-full space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/60 uppercase">Display name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-input-bg border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-theme-primary transition-colors"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/60 uppercase">Email Address</label>
              <input 
                type="email" 
                value={email}
                readOnly
                className="w-full bg-input-bg/50 border border-border rounded-xl px-4 py-2.5 text-foreground/60 cursor-not-allowed transition-colors"
              />
            </div>
            
            <p className="text-xs text-center text-foreground/50 pt-2">
              Your profile helps people recognize you in shared boards.
            </p>
          </div>
        </div>

        <div className="p-5 border-t border-border flex justify-end gap-3 bg-black/5">
          <button 
            onClick={() => setIsOpen(false)}
            className="px-5 py-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-foreground font-medium transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-5 py-2 rounded-full bg-theme-primary text-white font-medium hover:opacity-90 transition-opacity shadow-sm"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
