"use client";

import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useNotesStore } from '@/store/useNotesStore';
import { useBoardStore } from '@/store/useBoardStore';
import { useTemplateStore } from '@/store/useTemplateStore';
import {
  LayoutGrid, Archive, Trash2, Users, HelpCircle, LogOut,
  Plus, X, Frame, LayoutTemplate, BookmarkPlus, Check,
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import BoardSwitcher from './BoardSwitcher';

const EMOJIS = ['📋', '🚀', '💡', '🎨', '📝', '🔥', '🌟', '🧩', '📌', '🗂'];

export default function Sidebar() {
  const logout           = useAuthStore(state => state.logout);
  const router           = useRouter();
  const pathname         = usePathname();

  const isSidebarOpen    = useNotesStore(state => state.isSidebarOpen);
  const setIsSidebarOpen = useNotesStore(state => state.setIsSidebarOpen);
  const addNote          = useNotesStore(state => state.addNote);

  const activeBoardId    = useBoardStore(state => state.activeBoardId);
  const boards           = useBoardStore(state => state.boards);

  const { saveCustomTemplate } = useTemplateStore();

  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [saveName,   setSaveName]   = useState('');
  const [saveEmoji,  setSaveEmoji]  = useState('📋');

  const handleLogout = () => { logout(); router.push('/login'); };

  const handleAddNote = () => {
    addNote({
      title: '', content: '', color: 'yellow',
      boardId: activeBoardId || undefined,
      position: { x: Math.random() * 200 + 50, y: Math.random() * 200 + 100 },
      size: { width: 250, height: 250 },
    });
    setIsSidebarOpen(false);
    toast.success('Note created');
  };

  const handleAddFrame = () => {
    addNote({
      title: 'New Frame', content: '', color: 'transparent', isFrame: true,
      boardId: activeBoardId || undefined,
      position: { x: Math.random() * 200 + 50, y: Math.random() * 200 + 100 },
      size: { width: 500, height: 400 },
    });
    setIsSidebarOpen(false);
    toast.success('Frame added');
  };

  const handleSaveAsTemplate = async () => {
    const notes = useNotesStore.getState().notes
      .filter((n) => !n.isArchived && !n.isTrashed)
      .map((n) => ({
        title: n.title, content: n.content, color: n.color,
        position: n.position, size: n.size, isFrame: n.isFrame,
      }));

    if (!notes.length) { toast.error('No notes to save!'); return; }

    const activeBoard = boards.find((b) => b._id === activeBoardId);
    try {
      await saveCustomTemplate({
        name: saveName.trim() || activeBoard?.name || 'My Template',
        description: `${notes.length} notes · Custom template`,
        emoji: saveEmoji,
        notes,
      });
      toast.success('Template saved!');
      setIsSaveOpen(false);
      setSaveName('');
      setSaveEmoji('📋');
    } catch {
      toast.error('Failed to save template');
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Invisible spacer for desktop */}
      <div className="hidden md:block w-[72px] h-full shrink-0" />

      {/* Expandable Sidebar */}
      <aside className={`
        fixed md:absolute left-0 top-0 h-full w-[280px] md:w-[72px] md:hover:w-64
        transition-all duration-300 ease-in-out border-r border-border bg-surface
        flex flex-col z-50 overflow-x-hidden shadow-2xl md:shadow-xl group
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>

        {/* Mobile Close */}
        <div className="md:hidden absolute top-4 right-4 text-foreground/40 hover:text-foreground transition-colors">
          <button onClick={() => setIsSidebarOpen(false)}><X size={24} /></button>
        </div>

        <div className="pt-12 pb-2 px-3.5 flex flex-col gap-3 w-full whitespace-nowrap">
          {/* Add Note / Frame */}
          <div className="flex flex-col gap-2 w-full">
            <button
              onClick={handleAddNote}
              className="w-full h-11 rounded-xl bg-theme-secondary hover:bg-theme-primary/25 text-theme-primary flex items-center px-[11px] gap-4 transition-transform active:scale-95 shadow-sm group/btn"
              title="Add Note"
            >
              <Plus size={22} className="shrink-0" />
              <span className="font-medium text-[15px] opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">Add Note</span>
            </button>
            <button
              onClick={handleAddFrame}
              className="w-full h-11 rounded-xl border border-border hover:bg-black/5 dark:hover:bg-white/5 text-foreground flex items-center px-[11px] gap-4 transition-transform active:scale-95 shadow-sm group/btn"
              title="Add Frame"
            >
              <Frame size={22} className="shrink-0 opacity-70" />
              <span className="font-medium text-[15px] opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">Add Frame</span>
            </button>

            {/* Save as Template */}
            <div className="relative">
              <button
                onClick={() => setIsSaveOpen(!isSaveOpen)}
                className="w-full h-11 rounded-xl border border-dashed border-border hover:border-theme-primary/50 hover:bg-theme-secondary/30 text-foreground/60 hover:text-theme-primary flex items-center px-[11px] gap-4 transition-all active:scale-95 group/btn"
                title="Save board as template"
              >
                <BookmarkPlus size={22} className="shrink-0" />
                <span className="font-medium text-[15px] opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">Save as Template</span>
              </button>

              {/* Inline Save Modal */}
              {isSaveOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 z-[110] bg-surface border border-border rounded-xl p-3 shadow-xl">
                  {/* Emoji picker */}
                  <div className="flex gap-1 flex-wrap mb-2">
                    {EMOJIS.map((e) => (
                      <button
                        key={e}
                        onClick={() => setSaveEmoji(e)}
                        className={`text-base p-1 rounded-lg transition-colors ${saveEmoji === e ? 'bg-theme-secondary' : 'hover:bg-input-bg'}`}
                      >{e}</button>
                    ))}
                  </div>
                  <input
                    autoFocus
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveAsTemplate(); if (e.key === 'Escape') setIsSaveOpen(false); }}
                    placeholder="Template name..."
                    className="w-full text-sm bg-input-bg border border-border rounded-lg px-3 py-1.5 outline-none focus:border-theme-primary mb-2"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveAsTemplate}
                      className="flex-1 flex items-center justify-center gap-1 text-xs bg-theme-primary text-white rounded-lg py-1.5 font-medium hover:opacity-90"
                    >
                      <Check size={12} /> Save
                    </button>
                    <button
                      onClick={() => setIsSaveOpen(false)}
                      className="flex-1 text-xs bg-input-bg rounded-lg py-1.5 font-medium hover:bg-border transition-colors"
                    >Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Board Switcher */}
          <div className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
            <BoardSwitcher />
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col gap-2 px-3.5 w-full flex-1 whitespace-nowrap overflow-hidden">
          <Link href="/board" className={`w-full h-11 rounded-xl flex items-center px-[11px] gap-4 transition-colors group/btn shadow-sm ${pathname === '/board' ? 'bg-theme-secondary text-theme-primary' : 'text-foreground/60 hover:bg-input-bg hover:text-foreground'}`}>
            <LayoutGrid size={22} className="shrink-0" />
            <span className="font-semibold text-[15px] opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">My Notes</span>
          </Link>

          <Link href="/board/templates" className={`w-full h-11 rounded-xl flex items-center px-[11px] gap-4 transition-colors group/btn shadow-sm ${pathname === '/board/templates' ? 'bg-theme-secondary text-theme-primary' : 'text-foreground/60 hover:bg-input-bg hover:text-foreground'}`}>
            <LayoutTemplate size={22} className="shrink-0" />
            <span className="font-medium text-[15px] opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">Templates</span>
          </Link>

          <Link href="/board/archived" className={`w-full h-11 rounded-xl flex items-center px-[11px] gap-4 transition-colors group/btn shadow-sm ${pathname === '/board/archived' ? 'bg-theme-secondary text-theme-primary' : 'text-foreground/60 hover:bg-input-bg hover:text-foreground'}`}>
            <Archive size={22} className="shrink-0" />
            <span className="font-medium text-[15px] opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">Archive</span>
          </Link>

          <Link href="/board/trashed" className={`w-full h-11 rounded-xl flex items-center px-[11px] gap-4 transition-colors group/btn shadow-sm ${pathname === '/board/trashed' ? 'bg-theme-secondary text-theme-primary' : 'text-foreground/60 hover:bg-input-bg hover:text-foreground'}`}>
            <Trash2 size={22} className="shrink-0" />
            <span className="font-medium text-[15px] opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">Trash</span>
          </Link>

          <Link href="/board/shared" className={`w-full h-11 rounded-xl flex items-center px-[11px] gap-4 transition-colors group/btn shadow-sm ${pathname === '/board/shared' ? 'bg-theme-secondary text-theme-primary' : 'text-foreground/60 hover:bg-input-bg hover:text-foreground'}`}>
            <Users size={22} className="shrink-0" />
            <span className="font-medium text-[15px] opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">Shared</span>
          </Link>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-2 px-3.5 pb-6 pt-4 w-full whitespace-nowrap overflow-hidden">
          <button className="w-full h-11 rounded-xl text-foreground/60 hover:bg-input-bg hover:text-foreground flex items-center px-[11px] gap-4 transition-colors">
            <HelpCircle size={22} className="shrink-0" />
            <span className="font-medium text-[15px] opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">Help</span>
          </button>
          <button onClick={handleLogout} className="w-full h-11 rounded-xl text-foreground/60 hover:bg-red-50 hover:text-red-500 flex items-center px-[11px] gap-4 transition-colors">
            <LogOut size={22} className="shrink-0" />
            <span className="font-medium text-[15px] opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">Logout</span>
          </button>
        </div>

      </aside>
    </>
  );
}
