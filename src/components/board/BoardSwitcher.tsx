"use client";

import { useState, useEffect } from 'react';
import { useBoardStore, Board } from '@/store/useBoardStore';
import { ChevronDown, Plus, Trash2, LayoutGrid, Pencil, Check } from 'lucide-react';

const EMOJIS = ['📋', '🚀', '💡', '🎨', '📝', '🔥', '🌟', '🧩', '🏗️', '📌'];

export default function BoardSwitcher() {
  const { boards, activeBoardId, fetchBoards, createBoard, deleteBoard, updateBoard, setActiveBoardId } = useBoardStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('📋');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => { fetchBoards(); }, [fetchBoards]);

  const activeBoard = boards.find((b) => b._id === activeBoardId);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const board = await createBoard(newName.trim(), selectedEmoji);
    setActiveBoardId(board._id);
    setIsCreating(false);
    setNewName('');
    setSelectedEmoji('📋');
    setIsOpen(false);
  };

  const handleRename = async (board: Board) => {
    if (!editName.trim()) { setEditingId(null); return; }
    await updateBoard(board._id, { name: editName.trim() });
    setEditingId(null);
  };

  return (
    <div className="relative px-3 mb-2">
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
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
        <div className="absolute left-3 right-3 top-full mt-1 z-[100] bg-surface border border-border rounded-xl py-1 overflow-hidden shadow-xl max-h-72 overflow-y-auto">
          {/* Default Board */}
          <BoardItem
            emoji="🏠" name="Default Board" active={activeBoardId === null}
            onSelect={() => { setActiveBoardId(null); setIsOpen(false); }}
          />
          <div className="h-px bg-border my-1" />

          {/* User Boards */}
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
                key={board._id} emoji={board.emoji} name={board.name} active={activeBoardId === board._id}
                onSelect={() => { setActiveBoardId(board._id); setIsOpen(false); }}
                onEdit={() => { setEditingId(board._id); setEditName(board.name); }}
                onDelete={() => deleteBoard(board._id)}
              />
            )
          )}

          <div className="h-px bg-border my-1" />

          {/* Create New */}
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
  );
}

function BoardItem({ emoji, name, active, onSelect, onEdit, onDelete }: {
  emoji: string; name: string; active: boolean;
  onSelect: () => void; onEdit?: () => void; onDelete?: () => void;
}) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 hover:bg-input-bg transition-colors cursor-pointer group/item ${active ? 'bg-theme-secondary/50' : ''}`} onClick={onSelect}>
      <span className="text-base">{emoji}</span>
      <span className={`flex-1 text-sm truncate ${active ? 'text-theme-primary font-semibold' : 'text-foreground'}`}>{name}</span>
      {onEdit && (
        <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="opacity-0 group-hover/item:opacity-100 p-1 rounded hover:bg-black/10 transition-opacity">
          <Pencil size={12} />
        </button>
      )}
      {onDelete && (
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="opacity-0 group-hover/item:opacity-100 p-1 rounded hover:bg-red-100 hover:text-red-500 transition-opacity">
          <Trash2 size={12} />
        </button>
      )}
    </div>
  );
}
