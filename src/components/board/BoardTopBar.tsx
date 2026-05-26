"use client";

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/useAuthStore';
import { useBoardStore } from '@/store/useBoardStore';
import {
  Share2, Maximize2, Minus, Plus,
  X, Send, Users, FileImage, Download
} from 'lucide-react';
import toast from 'react-hot-toast';

interface OnlineUser {
  userId: string;
  name: string;
}

interface BoardTopBarProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitScreen: () => void;
  onResetZoom: () => void;
  onExportPng: () => void;
  onExportPdf: () => void;
}

const AVATAR_COLORS = [
  '#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444', '#14b8a6', '#f97316'
];

function getColor(userId: string) {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function Avatar({ name, userId, size = 28, title }: { name: string; userId: string; size?: number; title?: string }) {
  const color = getColor(userId);
  return (
    <div
      title={title || name}
      className="rounded-full flex items-center justify-center text-white font-bold text-xs border-2 border-surface shadow-sm flex-shrink-0 cursor-default"
      style={{ width: size, height: size, background: color, fontSize: size * 0.38 }}
    >
      {name[0]?.toUpperCase()}
    </div>
  );
}

export default function BoardTopBar({ scale, onZoomIn, onZoomOut, onFitScreen, onResetZoom, onExportPng, onExportPdf }: BoardTopBarProps) {
  const token = useAuthStore(state => state.token);
  const currentUser = useAuthStore(state => state.user);
  const { boards, activeBoardId, shareBoard } = useBoardStore();
  const activeBoard = activeBoardId ? boards.find(b => b._id === activeBoardId) : null;

  // Live online users in this board room
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const socketRef = useRef<Socket | null>(null);

  // Share popover
  const [shareOpen, setShareOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareLoading, setShareLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const shareBtnRef = useRef<HTMLButtonElement>(null);
  const shareInputRef = useRef<HTMLInputElement>(null);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });

  useEffect(() => { setMounted(true); }, []);

  // Connect socket to track online users
  useEffect(() => {
    if (!token || !activeBoardId) { setOnlineUsers([]); return; }

    const socket: Socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join-board', activeBoardId);
    });

    socket.on('user-joined', (user: OnlineUser) => {
      setOnlineUsers(prev => {
        if (prev.find(u => u.userId === user.userId)) return prev;
        return [...prev, user];
      });
    });

    socket.on('user-left', ({ userId }: { userId: string }) => {
      setOnlineUsers(prev => prev.filter(u => u.userId !== userId));
    });

    return () => {
      socket.emit('leave-board', activeBoardId);
      socket.disconnect();
      setOnlineUsers([]);
    };
  }, [token, activeBoardId]);

  // Open share popover
  const openShare = () => {
    if (!activeBoard) { toast.error('Select a board first'); return; }
    const btn = shareBtnRef.current;
    if (btn) {
      const rect = btn.getBoundingClientRect();
      setPopoverPos({ top: rect.bottom + 8, left: Math.max(16, rect.right - 288) });
    }
    setShareOpen(true);
    setShareEmail('');
    setTimeout(() => shareInputRef.current?.focus(), 80);
  };

  const handleShare = async () => {
    if (!shareEmail.trim() || !activeBoardId) return;
    setShareLoading(true);
    try {
      await shareBoard(activeBoardId, shareEmail.trim());
      toast.success('Board shared! Email sent.');
      setShareEmail('');
      setShareOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to share board');
    } finally {
      setShareLoading(false);
    }
  };

  // Close on outside click
  useEffect(() => {
    if (!shareOpen) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest('[data-topbar-share]')) setShareOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [shareOpen]);

  const zoomPct = Math.round(scale * 100);
  
  // Combine owner and collaborators into one array
  const allMembers = activeBoard ? [
    ...(typeof activeBoard.userId === 'object' && activeBoard.userId !== null ? [activeBoard.userId] : []),
    ...(activeBoard.sharedWith || [])
  ] : [];
  
  const hasOtherMembers = allMembers.length > 1 || (allMembers.length === 1 && allMembers[0]._id !== currentUser?._id);

  return (
    <>
      {/* ── Top Bar ── */}
      <div
        data-html2canvas-ignore="true"
        className="absolute top-3 right-4 z-30 flex items-center gap-2 max-w-[calc(100vw-32px)] overflow-x-auto custom-scrollbar"
      >
        {/* ZOOM CONTROLS + EXPORT */}
        <div className="flex items-center gap-0.5 bg-surface/90 backdrop-blur-md border border-border rounded-xl px-1.5 py-1 shadow-lg">
          <button
            onClick={onZoomOut}
            className="p-1.5 rounded-lg hover:bg-input-bg transition-colors text-foreground/60 hover:text-foreground"
            title="Zoom out"
          >
            <Minus size={13} />
          </button>
          <button
            onClick={onResetZoom}
            className="px-2 py-1 text-xs font-semibold text-foreground/70 hover:text-foreground hover:bg-input-bg rounded-lg transition-colors min-w-[46px] text-center tabular-nums"
            title="Reset zoom"
          >
            {zoomPct}%
          </button>
          <button
            onClick={onZoomIn}
            className="p-1.5 rounded-lg hover:bg-input-bg transition-colors text-foreground/60 hover:text-foreground"
            title="Zoom in"
          >
            <Plus size={13} />
          </button>
          <div className="w-px h-4 bg-border mx-0.5" />
          <button
            onClick={onFitScreen}
            className="p-1.5 rounded-lg hover:bg-input-bg transition-colors text-foreground/60 hover:text-foreground"
            title="Fit to screen"
          >
            <Maximize2 size={13} />
          </button>
          <div className="w-px h-4 bg-border mx-0.5" />
          <button
            onClick={onExportPng}
            className="p-1.5 rounded-lg hover:bg-input-bg transition-colors text-foreground/60 hover:text-foreground"
            title="Export as PNG"
          >
            <FileImage size={13} />
          </button>
          <button
            onClick={onExportPdf}
            className="p-1.5 rounded-lg hover:bg-input-bg transition-colors text-foreground/60 hover:text-foreground"
            title="Export as PDF"
          >
            <Download size={13} />
          </button>
        </div>

        {/* COLLABORATORS + SHARE */}
        {activeBoardId && (
          <div className="flex items-center gap-1.5 bg-surface/90 backdrop-blur-md border border-border rounded-xl px-2 py-1 shadow-lg">
            
            {/* Avatars group with overlapping */}
            <div className="flex items-center -space-x-1.5 mr-1">
              {/* Current user (You) */}
              {currentUser && (
                <div className="relative z-10 hover:-translate-y-0.5 transition-transform">
                  <Avatar name={currentUser.name} userId={currentUser._id || ''} title="You" />
                  <div className="absolute -bottom-[1px] -right-[1px] w-2.5 h-2.5 rounded-full bg-green-500 border-[1.5px] border-surface" />
                </div>
              )}

              {/* Online collaborators (filter out currentUser) */}
              {onlineUsers.filter(u => u.userId !== currentUser?._id).slice(0, 4).map((u, i) => (
                <div key={u.userId} className="relative hover:-translate-y-0.5 transition-transform" style={{ zIndex: 9 - i }}>
                  <Avatar name={u.name} userId={u.userId} title={`${u.name} (online)`} />
                  <div className="absolute -bottom-[1px] -right-[1px] w-2.5 h-2.5 rounded-full bg-green-500 border-[1.5px] border-surface" />
                </div>
              ))}
              
              {/* Extra online users */}
              {onlineUsers.length > 5 && (
                <div className="w-7 h-7 rounded-full bg-input-bg border-[1.5px] border-surface flex items-center justify-center text-[10px] font-bold text-foreground/60 relative z-0">
                  +{onlineUsers.length - 5}
                </div>
              )}

              {/* Existing board members (offline) */}
              {allMembers
                .filter(u => u._id !== currentUser?._id && !onlineUsers.find(o => o.userId === u._id))
                .slice(0, 3).map((u, i) => (
                  <div key={u._id} className="relative opacity-60 hover:opacity-100 hover:-translate-y-0.5 transition-all" style={{ zIndex: 5 - i }}>
                    <Avatar name={u.name} userId={u._id} title={`${u.name} (offline)`} />
                  </div>
                ))}
            </div>

            {hasOtherMembers && <div className="w-px h-4 bg-border mx-0.5" />}

            {/* Share button */}
            <button
              ref={shareBtnRef}
              data-topbar-share
              onClick={openShare}
              className="flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-lg bg-theme-primary text-white text-xs font-semibold hover:opacity-90 active:scale-95 transition-all shadow-sm"
            >
              <Share2 size={12} />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Share Popover (Portal) ── */}
      {mounted && shareOpen && activeBoard && createPortal(
        <div
          data-topbar-share
          className="fixed z-[99999] w-72 bg-surface border border-border rounded-2xl shadow-2xl p-4"
          style={{ top: popoverPos.top, left: popoverPos.left }}
        >
          {/* Arrow up */}
          <div className="absolute -top-[7px] right-6 w-3.5 h-3.5 bg-surface border-t border-l border-border rotate-45" />

          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">{activeBoard.emoji}</span>
              <div>
                <p className="text-sm font-bold text-foreground leading-tight">Share Board</p>
                <p className="text-xs text-foreground/50 truncate max-w-[150px]">{activeBoard.name}</p>
              </div>
            </div>
            <button onClick={() => setShareOpen(false)} className="p-1.5 rounded-lg hover:bg-input-bg text-foreground/40 hover:text-foreground transition-colors">
              <X size={14} />
            </button>
          </div>

          {/* Online now */}
          {onlineUsers.length > 0 && (
            <div className="mb-3 pb-3 border-b border-border">
              <p className="text-[10px] text-green-500 font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                Online now
              </p>
              <div className="flex items-center gap-1.5">
                {onlineUsers.map(u => (
                  <div key={u.userId} className="flex items-center gap-1.5 bg-green-500/10 rounded-full px-2 py-0.5">
                    <Avatar name={u.name} userId={u.userId} size={18} />
                    <span className="text-[11px] font-medium text-foreground truncate max-w-[80px]">{u.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Members list */}
          {allMembers.length > 0 && (
            <div className="mb-4 pb-4 border-b border-border">
              <p className="text-[10px] text-foreground/40 font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
                <Users size={10} /> Members ({allMembers.length})
              </p>
              <div className="flex flex-col gap-2">
                {allMembers.map(u => {
                  const isOnline = onlineUsers.find(o => o.userId === u._id);
                  const isOwner = typeof activeBoard.userId === 'object' && activeBoard.userId !== null && activeBoard.userId._id === u._id;
                  return (
                    <div key={u._id} className="flex items-center gap-2">
                      <div className="relative">
                        <Avatar name={u.name} userId={u._id} size={26} />
                        {isOnline && <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-surface bg-green-500" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate flex items-center gap-1.5">
                          {u.name} 
                          {isOwner && <span className="text-[9px] bg-theme-primary/10 text-theme-primary px-1.5 py-0.5 rounded-sm">Owner</span>}
                        </p>
                        <p className="text-[10px] text-foreground/40 truncate">{u.email}</p>
                      </div>
                      {isOnline && <span className="ml-auto text-[10px] text-green-500 font-medium flex-shrink-0">Online</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Invite */}
          <p className="text-[10px] text-foreground/50 font-semibold uppercase tracking-wider mb-2">Invite by email</p>
          <div className="flex gap-2">
            <input
              ref={shareInputRef}
              type="email"
              placeholder="name@example.com"
              value={shareEmail}
              onChange={e => setShareEmail(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleShare(); if (e.key === 'Escape') setShareOpen(false); }}
              className="flex-1 text-sm bg-input-bg border border-border rounded-xl px-3 py-2 outline-none focus:border-theme-primary transition-colors"
            />
            <button
              onClick={handleShare}
              disabled={shareLoading || !shareEmail.trim()}
              className="p-2.5 rounded-xl bg-theme-primary text-white hover:opacity-90 active:scale-95 transition-all disabled:opacity-40"
            >
              {shareLoading
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Send size={15} />}
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
