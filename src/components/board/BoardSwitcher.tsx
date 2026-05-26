"use client";

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useBoardStore, Board } from '@/store/useBoardStore';
import { useNotesStore } from '@/store/useNotesStore';
import { ChevronDown, Plus, Trash2, Pencil, Check, Share2, X, Users, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const EMOJIS = ['📋', '🚀', '💡', '🎨', '📝', '🔥', '🌟', '🧩', '🏗️', '📌'];

interface SharePopoverState {
  boardId: string;
  top: number;
  left: number;
}

export default function BoardSwitcher() {
  const { boards, activeBoardId, fetchBoards, createBoard, deleteBoard, updateBoard, setActiveBoardId, shareBoard } = useBoardStore();
  const setIsSidebarOpen = useNotesStore(state => state.setIsSidebarOpen);
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('📋');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [sharePopover, setSharePopover] = useState<SharePopoverState | null>(null);
  const [shareEmail, setShareEmail] = useState('');
  const [shareLoading, setShareLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const shareInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchBoards(); setMounted(true); }, [fetchBoards]);

  useEffect(() => {
    if (sharePopover) setTimeout(() => shareInputRef.current?.focus(), 50);
  }, [sharePopover]);

  useEffect(() => {
    if (!sharePopover) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-share-popover]') && !target.closest('[data-share-btn]')) {
        setSharePopover(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [sharePopover]);

  const activeBoard = boards.find((b) => b._id === activeBoardId);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const board = await createBoard(newName.trim(), selectedEmoji);
    setActiveBoardId(board._id);
    setIsCreating(false);
    setNewName('');
    setSelectedEmoji('📋');
    setIsOpen(false);
    setIsSidebarOpen(false);
  };

  const handleRename = async (board: Board) => {
    if (!editName.trim()) { setEditingId(null); return; }
    await updateBoard(board._id, { name: editName.trim() });
    setEditingId(null);
  };

  const openSharePopover = (boardId: string, btnEl: HTMLButtonElement) => {
    // getBoundingClientRect gives position relative to viewport — perfect for fixed
    const rect = btnEl.getBoundingClientRect();
    setSharePopover({
      boardId,
      top: rect.top - 16,          // align near the button
      left: rect.right + 16,       // right of the sidebar
    });
    setShareEmail('');
  };

  const handleShare = async () => {
    if (!shareEmail.trim() || !sharePopover) return;
    setShareLoading(true);
    try {
      await shareBoard(sharePopover.boardId, shareEmail.trim());
      toast.success('Board shared! Email notification sent.');
      setSharePopover(null);
      setShareEmail('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to share board');
    } finally {
      setShareLoading(false);
    }
  };

  const sharingBoard = sharePopover ? boards.find(b => b._id === sharePopover.boardId) : null;

  const popoverEl = mounted && sharePopover && sharingBoard ? createPortal(
    <div
      data-share-popover
      className="fixed z-[99999] w-72 bg-surface border border-border rounded-2xl shadow-2xl p-4"
      style={{ top: sharePopover.top, left: sharePopover.left }}
    >
      {/* Arrow pointing left toward sidebar */}
      <div
        className="absolute -left-[7px] top-5 w-3.5 h-3.5 bg-surface border-l border-b border-border"
        style={{ transform: 'rotate(45deg)' }}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{sharingBoard.emoji}</span>
          <div>
            <p className="text-sm font-bold text-foreground leading-tight">Share Board</p>
            <p className="text-xs text-foreground/50 truncate max-w-[160px]">{sharingBoard.name}</p>
          </div>
        </div>
        <button
          onClick={() => setSharePopover(null)}
          className="p-1.5 rounded-lg hover:bg-input-bg text-foreground/40 hover:text-foreground transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Existing Members */}
      {sharingBoard.sharedWith && sharingBoard.sharedWith.length > 0 && (
        <div className="mb-4 pb-4 border-b border-border">
          <p className="text-[10px] text-foreground/40 font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
            <Users size={10} /> Members ({sharingBoard.sharedWith.length})
          </p>
          <div className="flex flex-col gap-2">
            {sharingBoard.sharedWith.map((u) => (
              <div key={u._id} className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-theme-primary/20 text-theme-primary flex items-center justify-center text-xs font-bold shrink-0">
                  {u.name[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{u.name}</p>
                  <p className="text-[10px] text-foreground/40 truncate">{u.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Email Input */}
      <p className="text-[10px] text-foreground/50 font-semibold uppercase tracking-wider mb-2">Invite by email</p>
      <div className="flex gap-2">
        <input
          ref={shareInputRef}
          type="email"
          placeholder="name@example.com"
          value={shareEmail}
          onChange={(e) => setShareEmail(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleShare(); if (e.key === 'Escape') setSharePopover(null); }}
          className="flex-1 text-sm bg-input-bg border border-border rounded-xl px-3 py-2 outline-none focus:border-theme-primary transition-colors"
        />
        <button
          data-share-btn
          onClick={handleShare}
          disabled={shareLoading || !shareEmail.trim()}
          className="p-2.5 rounded-xl bg-theme-primary text-white hover:opacity-90 active:scale-95 transition-all disabled:opacity-40"
          title="Send invite"
        >
          {shareLoading
            ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <Send size={15} />}
        </button>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <div className="relative px-3 mb-2">
        {/* Trigger */}
        <button
          onClick={() => { setIsOpen(!isOpen); setSharePopover(null); }}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-input-bg hover:bg-theme-secondary text-foreground transition-colors text-sm font-medium"
        >
          <span className="text-base">{activeBoard?.emoji || '🏠'}</span>
          <span className="flex-1 text-left truncate opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
            {activeBoard?.name || 'Default Board'}
          </span>
          <ChevronDown size={14} className={`shrink-0 transition-transform opacity-100 md:opacity-0 md:group-hover:opacity-100 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute left-3 right-3 top-full mt-1 z-[100] bg-surface border border-border rounded-xl py-1 shadow-xl max-h-72 overflow-y-auto">
            <BoardItem
              emoji="🏠" name="Default Board" active={activeBoardId === null}
              onSelect={() => { setActiveBoardId(null); setIsOpen(false); setSharePopover(null); setIsSidebarOpen(false); }}
            />
            <div className="h-px bg-border my-1" />

            {boards.map((board) =>
              editingId === board._id ? (
                <div key={board._id} className="flex items-center gap-2 px-3 py-2">
                  <span>{board.emoji}</span>
                  <input
                    autoFocus value={editName} onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleRename(board); if (e.key === 'Escape') setEditingId(null); }}
                    className="flex-1 text-sm bg-input-bg border border-border rounded-lg px-2 py-1 outline-none"
                  />
                  <button onClick={() => handleRename(board)} className="p-1 rounded hover:bg-input-bg"><Check size={13} /></button>
                </div>
              ) : (
                <BoardItem
                  key={board._id}
                  emoji={board.emoji}
                  name={board.name}
                  active={activeBoardId === board._id}
                  sharedCount={board.sharedWith?.length}
                  isSharing={sharePopover?.boardId === board._id}
                  onSelect={() => { setActiveBoardId(board._id); setIsOpen(false); setSharePopover(null); setIsSidebarOpen(false); }}
                  onEdit={() => { setEditingId(board._id); setEditName(board.name); setSharePopover(null); }}
                  onShare={(btnEl) => {
                    if (sharePopover?.boardId === board._id) {
                      setSharePopover(null);
                    } else {
                      openSharePopover(board._id, btnEl);
                    }
                  }}
                  onDelete={() => { deleteBoard(board._id); setSharePopover(null); }}
                />
              )
            )}

            <div className="h-px bg-border my-1" />

            {isCreating ? (
              <div className="px-3 py-2 flex flex-col gap-2">
                <div className="flex gap-1 flex-wrap">
                  {EMOJIS.map((e) => (
                    <button key={e} onClick={() => setSelectedEmoji(e)} className={`text-base p-1 rounded-lg transition-colors ${selectedEmoji === e ? 'bg-theme-secondary' : 'hover:bg-input-bg'}`}>{e}</button>
                  ))}
                </div>
                <input
                  autoFocus placeholder="Board name..." value={newName} onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setIsCreating(false); }}
                  className="w-full text-sm bg-input-bg border border-border rounded-lg px-3 py-1.5 outline-none focus:border-theme-primary"
                />
                <div className="flex gap-2">
                  <button onClick={handleCreate} className="flex-1 text-xs bg-theme-primary text-white rounded-lg py-1.5 font-medium hover:opacity-90 transition-opacity">Create</button>
                  <button onClick={() => setIsCreating(false)} className="flex-1 text-xs bg-input-bg rounded-lg py-1.5 font-medium hover:bg-border transition-colors">Cancel</button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsCreating(true)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground/60 hover:text-foreground hover:bg-input-bg transition-colors"
              >
                <Plus size={14} /> New Board
              </button>
            )}
          </div>
        )}
      </div>

      {/* Portal-rendered popover — renders directly in <body>, not clipped by sidebar */}
      {popoverEl}
    </>
  );
}

function BoardItem({ emoji, name, active, sharedCount, isSharing, onSelect, onEdit, onShare, onDelete }: {
  emoji: string; name: string; active: boolean; sharedCount?: number; isSharing?: boolean;
  onSelect: () => void; onEdit?: () => void;
  onShare?: (btn: HTMLButtonElement) => void;
  onDelete?: () => void;
}) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 hover:bg-input-bg transition-colors cursor-pointer group/item ${active ? 'bg-theme-secondary/50' : ''}`}
      onClick={onSelect}
    >
      <span className="text-base">{emoji}</span>
      <span className={`flex-1 text-sm truncate ${active ? 'text-theme-primary font-semibold' : 'text-foreground'}`}>{name}</span>

      {sharedCount && sharedCount > 0 ? (
        <span className="flex items-center gap-0.5 text-[10px] text-foreground/40 group-hover/item:hidden">
          <Users size={10} />{sharedCount}
        </span>
      ) : null}

      <div className="hidden group-hover/item:flex items-center gap-0.5">
        {onShare && (
          <button
            data-share-btn
            onClick={(e) => { e.stopPropagation(); onShare(e.currentTarget as HTMLButtonElement); }}
            className={`p-1 rounded-lg transition-colors ${isSharing ? 'bg-theme-primary/15 text-theme-primary' : 'hover:bg-theme-primary/10 hover:text-theme-primary'}`}
            title="Share board"
          >
            <Share2 size={12} />
          </button>
        )}
        {onEdit && (
          <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1 rounded-lg hover:bg-black/10 transition-colors" title="Rename">
            <Pencil size={12} />
          </button>
        )}
        {onDelete && (
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 rounded-lg hover:bg-red-100 hover:text-red-500 transition-colors" title="Delete">
            <Trash2 size={12} />
          </button>
        )}
      </div>
    </div>
  );
}
