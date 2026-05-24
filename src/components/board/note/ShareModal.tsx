"use client";

import { useState } from 'react';
import { useNotesStore } from '@/store/useNotesStore';
import { useAuthStore } from '@/store/useAuthStore';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import api from '@/lib/api';

export default function ShareModal() {
  const activeShareNoteId = useNotesStore(state => state.activeShareNoteId);
  const setActiveShareNoteId = useNotesStore(state => state.setActiveShareNoteId);
  const note = useNotesStore(state => state.notes.find(n => n._id === activeShareNoteId));
  const updateNote = useNotesStore(state => state.updateNote);
  const user = useAuthStore(state => state.user);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [shareMessage, setShareMessage] = useState({ text: '', type: '' });

  if (!activeShareNoteId || !note) return null;

  const noteOwnerId = typeof note.userId === 'object' ? note.userId?._id : note.userId;
  const isOwner = noteOwnerId === user?._id;

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      if (!note.shareToken) {
        // Generate new token via API
        const res = await api.post(`/notes/${note._id}/share`);
        updateNote(note._id, { shareToken: res.data.data.shareToken, isPublic: true });
      } else {
        // Just toggle public status
        const newStatus = !note.isPublic;
        await api.patch(`/notes/${note._id}`, { isPublic: newStatus });
        updateNote(note._id, { isPublic: newStatus });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevoke = async () => {
    setIsLoading(true);
    try {
      await api.patch(`/notes/${note._id}`, { shareToken: null, isPublic: false });
      updateNote(note._id, { shareToken: null, isPublic: false });
      setActiveShareNoteId(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const shareUrl = note.shareToken ? `${window.location.origin}/share/${note.shareToken}` : '';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-surface border border-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <h3 className="font-semibold text-foreground text-[15px]">Share this note</h3>
          <button onClick={() => setActiveShareNoteId(null)} className="text-foreground/40 hover:text-foreground transition-colors p-1 rounded-md hover:bg-input-bg">
            <X size={18} />
          </button>
        </div>
        
        <div className="p-6 flex flex-col gap-6">
          {isOwner ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground text-[14px]">Public link</p>
                  <p className="text-[13px] text-foreground/60 mt-0.5">Anyone with the link can view this note</p>
                </div>
                
                <button 
                  onClick={handleToggle}
                  disabled={isLoading}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${note.isPublic ? 'bg-theme-primary' : 'bg-input-bg'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${note.isPublic ? 'translate-x-[22px]' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 bg-input-bg border border-border rounded-lg px-4 py-2.5 text-sm text-foreground/60 truncate select-all">
                  {note.isPublic && shareUrl ? shareUrl : 'stickynotes.com/share/...'}
                </div>
                <button 
                  onClick={() => { 
                    if(note.isPublic && shareUrl) {
                      navigator.clipboard.writeText(shareUrl); 
                      toast.success('Link copied to clipboard!');
                    }
                  }}
                  disabled={!note.isPublic || !shareUrl}
                  className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${note.isPublic ? 'bg-theme-primary text-surface hover:opacity-90' : 'bg-input-bg text-foreground/40 cursor-not-allowed'}`}
                >
                  Copy Link
                </button>
              </div>

              {note.shareToken && (
                <button onClick={handleRevoke} className="text-[13px] text-red-500 font-medium hover:text-red-600 self-start mt-1">
                  Revoke Link
                </button>
              )}
              {/* User-to-User Sharing */}
              <div className="pt-4 border-t border-border">
                <div>
                  <p className="font-semibold text-foreground text-[14px]">Share with user</p>
                  <p className="text-[13px] text-foreground/60 mt-0.5 mb-3">Share this note directly to another user's dashboard</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <input 
                    type="email" 
                    placeholder="Email address" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-input-bg border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:border-theme-primary transition-colors"
                  />
                  <button 
                    onClick={async () => {
                      if (!email) return;
                      setIsLoading(true);
                      try {
                        const res = await api.post(`/notes/${note._id}/share-user`, { email });
                        updateNote(note._id, { sharedWith: res.data.data.sharedWith });
                        setShareMessage({ text: 'Shared successfully!', type: 'success' });
                        setEmail('');
                      } catch (error: any) {
                        setShareMessage({ text: error.response?.data?.message || 'Failed to share', type: 'error' });
                      } finally {
                        setIsLoading(false);
                        setTimeout(() => setShareMessage({ text: '', type: '' }), 3000);
                      }
                    }}
                    disabled={isLoading || !email}
                    className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-foreground text-surface hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Share
                  </button>
                </div>
                {shareMessage.text && (
                  <p className={`mt-2 text-[13px] font-medium ${shareMessage.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                    {shareMessage.text}
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="bg-theme-primary/10 text-theme-primary p-4 rounded-lg text-sm mb-2 border border-theme-primary/20">
              <p className="font-medium">Shared with you</p>
              <p className="mt-0.5 text-[12.5px] opacity-90 leading-relaxed">You are viewing a shared note. Only the original owner of this note can manage sharing settings and add new users.</p>
            </div>
          )}

          {isOwner ? (
            note.sharedWith && note.sharedWith.length > 0 && (
              <div className="mt-4 border-t border-border pt-3">
                <p className="text-xs font-semibold text-foreground/40 uppercase tracking-wider mb-2">People with access</p>
                <div className="flex flex-col gap-2 max-h-32 overflow-y-auto">
                  {note.sharedWith.map((u: any) => (
                    <div key={u._id || u} className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-theme-primary/10 text-theme-primary flex items-center justify-center text-xs font-bold shrink-0">
                        {u.name ? u.name.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div className="flex-1 truncate">
                        <p className="text-sm font-medium text-foreground truncate">{u.name || 'Unknown'}</p>
                        <p className="text-[11px] text-foreground/60 truncate">{u.email || 'Email hidden'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ) : (
            typeof note.userId === 'object' && note.userId !== null && (
              <div className="pt-3 mt-1 border-t border-border">
                <p className="text-xs font-semibold text-foreground/40 uppercase tracking-wider mb-2">Shared by</p>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-theme-primary/10 text-theme-primary flex items-center justify-center text-xs font-bold shrink-0">
                    {note.userId.name ? note.userId.name.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div className="flex-1 truncate">
                    <p className="text-sm font-medium text-foreground truncate">{note.userId.name || 'Unknown User'}</p>
                    <p className="text-[11px] text-foreground/60 truncate">{note.userId.email || 'Email hidden'}</p>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
