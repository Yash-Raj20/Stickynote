"use client";

import { useState, useRef, useEffect } from 'react';
import { useNotesStore } from '@/store/useNotesStore';
import { MoreHorizontal, Palette, Tag, Share2, Trash2, Archive } from 'lucide-react';
import toast from 'react-hot-toast';
import { themeConfig, ThemeConfig } from './theme';

interface NoteMenuProps {
  noteId: string;
  color: string;
  currentTheme: ThemeConfig;
  onAddTagClick: () => void;
  onMenuOpenChange?: (isOpen: boolean) => void;
}

export default function NoteMenu({ noteId, color, currentTheme, onAddTagClick, onMenuOpenChange }: NoteMenuProps) {
  const updateNote = useNotesStore(state => state.updateNote);
  const deleteNote = useNotesStore(state => state.deleteNote);
  const note = useNotesStore(state => state.notes.find(n => n._id === noteId));
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onMenuOpenChange?.(isMenuOpen);
  }, [isMenuOpen, onMenuOpenChange]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
        setIsColorPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative no-drag shrink-0" ref={menuRef}>
      <button 
        onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); setIsColorPickerOpen(false); }}
        className={`p-1.5 rounded-full hover:bg-black/10 transition-colors ${currentTheme.text} opacity-50 hover:opacity-100`}
      >
        <MoreHorizontal size={20} />
      </button>

      {isMenuOpen && (
        <div className="absolute top-full right-0 mt-1 w-48 bg-surface rounded-lg shadow-xl border border-border py-1 flex flex-col overflow-hidden origin-top-right animate-in fade-in zoom-in-95 duration-100">
          {!note?.isFrame && (
            <>
              <button 
                onClick={() => setIsColorPickerOpen(!isColorPickerOpen)} 
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-input-bg text-sm text-foreground opacity-80 transition-colors w-full text-left"
              >
                 <Palette size={16} /> Change Color
              </button>
              
              {isColorPickerOpen && (
                 <div className="px-4 py-3 grid grid-cols-4 gap-3 bg-black/5">
                   {Object.keys(themeConfig).map(c => (
                      <div 
                        key={c} 
                        onClick={() => { updateNote(noteId, { color: c }); setIsMenuOpen(false); }} 
                        className={`w-6 h-6 rounded-full cursor-pointer border-2 ${color === c ? 'border-theme-primary scale-110' : 'border-black/10 hover:scale-110'} transition-transform ${themeConfig[c].bg}`} 
                        title={c}
                      />
                   ))}
                 </div>
              )}
              
              <button 
                onClick={() => { onAddTagClick(); setIsMenuOpen(false); }}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-input-bg text-sm text-foreground opacity-80 transition-colors w-full text-left"
              >
                 <Tag size={16} /> Add Tags
              </button>
              <div className="h-px w-full bg-border my-1" />
            </>
          )}
          
          <button 
            onClick={() => {
              const setActiveShareNoteId = useNotesStore.getState().setActiveShareNoteId;
              setActiveShareNoteId(noteId);
              setIsMenuOpen(false);
            }}
            className="flex items-center gap-3 px-4 py-2.5 hover:bg-input-bg text-sm text-foreground opacity-80 transition-colors w-full text-left"
          >
             <Share2 size={16} /> Share Note
          </button>
          
          {note?.isArchived ? (
            <button 
              onClick={() => { updateNote(noteId, { isArchived: false }); setIsMenuOpen(false); toast.success('Note unarchived'); }} 
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-input-bg text-sm text-foreground opacity-80 transition-colors w-full text-left"
            >
               <Archive size={16} /> Unarchive Note
            </button>
          ) : (
            <button 
              onClick={() => { updateNote(noteId, { isArchived: true }); setIsMenuOpen(false); toast.success('Note archived'); }} 
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-input-bg text-sm text-foreground opacity-80 transition-colors w-full text-left"
            >
               <Archive size={16} /> Archive Note
            </button>
          )}

          {note?.isTrashed ? (
            <>
              <button 
                onClick={() => { updateNote(noteId, { isTrashed: false }); setIsMenuOpen(false); toast.success('Note restored'); }} 
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-input-bg text-sm text-foreground opacity-80 transition-colors w-full text-left"
              >
                 <Trash2 size={16} /> Restore Note
              </button>
              <button 
                onClick={() => { deleteNote(noteId); toast.success('Note deleted forever'); }} 
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-sm text-red-500 font-medium transition-colors w-full text-left"
              >
                 <Trash2 size={16} /> Delete Forever
              </button>
            </>
          ) : (
            <button 
              onClick={() => { updateNote(noteId, { isTrashed: true }); setIsMenuOpen(false); toast.success('Moved to trash'); }} 
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-sm text-red-500 font-medium transition-colors w-full text-left"
            >
               <Trash2 size={16} /> Move to Trash
            </button>
          )}
        </div>
      )}
    </div>
  );
}
