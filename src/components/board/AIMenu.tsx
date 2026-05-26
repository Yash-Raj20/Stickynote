"use client";

import { useState } from 'react';
import { useNotesStore } from '@/store/useNotesStore';
import { useBoardStore } from '@/store/useBoardStore';
import { Sparkles, BrainCircuit, LayoutGrid, FileText, Loader2, X, Palette, GitMerge, Undo2 } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { addConnectionApi, removeConnectionApi } from './ArrowLayer';

export default function AIMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [loadingType, setLoadingType] = useState<string | null>(null);
  const [topic, setTopic] = useState('');
  const [aiBackup, setAiBackup] = useState<{
    type: 'color' | 'connect';
    previousColors?: { id: string, color: string }[];
    addedConnections?: { sourceId: string, targetId: string }[];
  } | null>(null);

  const notes = useNotesStore(state => state.notes);
  const addNote = useNotesStore(state => state.addNote);
  const updateNote = useNotesStore(state => state.updateNote);
  const activeBoardId = useBoardStore(state => state.activeBoardId);

  const activeNotes = notes.filter(n => !n.isArchived && !n.isTrashed && !n.isFrame);

  const handleBrainstorm = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }
    setLoadingType('brainstorm');
    try {
      const res = await api.post('/ai/brainstorm', { topic });
      const newNotes = res.data.data;

      let startX = 100;
      let startY = 100;

      newNotes.forEach((note: any, i: number) => {
        addNote({
          title: note.title,
          content: note.content,
          color: note.color || 'yellow',
          boardId: activeBoardId || undefined,
          position: { x: startX + (i * 370), y: startY + (i % 2 === 0 ? 0 : 50) },
          size: { width: 350, height: 250 },
        });
      });
      toast.success('Brainstorming complete!');
      setTopic('');
      setIsOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'AI request failed');
    } finally {
      setLoadingType(null);
    }
  };

  const handleCategorize = async () => {
    if (activeNotes.length < 3) {
      toast.error('You need at least 3 notes to categorize');
      return;
    }
    setLoadingType('categorize');
    try {
      const payload = activeNotes.map(n => ({ id: n._id, title: n.title, content: n.content }));
      const res = await api.post('/ai/categorize', { notes: payload });
      const categories = res.data.data;

      let currentY = 100;

      categories.forEach((cat: any, i: number) => {
        const notesInCategory = cat.noteIds
          .map((id: string) => activeNotes.find(n => n._id === id))
          .filter(Boolean);

        if (notesInCategory.length === 0) return;

        const maxCols = 3;
        const paddingX = 40;
        const paddingYTop = 70;
        const paddingYBottom = 40;
        const gap = 30;

        let currentX_inside = paddingX;
        let currentY_inside = paddingYTop;
        let rowMaxHeight = 0;
        let maxRowWidth = 0;

        // Pass 1: compute positions and exact frame size
        const positions: { id: string, x: number, y: number }[] = [];
        notesInCategory.forEach((note: any, index: number) => {
          const w = note.size?.width || 250;
          const h = note.size?.height || 250;

          if (index > 0 && index % maxCols === 0) {
            // Next row
            currentX_inside = paddingX;
            currentY_inside += rowMaxHeight + gap;
            rowMaxHeight = 0;
          }

          positions.push({ id: note._id, x: currentX_inside, y: currentY_inside });

          rowMaxHeight = Math.max(rowMaxHeight, h);
          currentX_inside += w + gap;
          maxRowWidth = Math.max(maxRowWidth, currentX_inside);
        });

        const frameWidth = Math.max(400, maxRowWidth);
        const frameHeight = Math.max(300, currentY_inside + rowMaxHeight + paddingYBottom);

        // Create a frame for each category
        const frameId = `frame_${Date.now()}_${i}`;
        addNote({
          title: cat.categoryName,
          content: '',
          color: 'transparent',
          isFrame: true,
          boardId: activeBoardId || undefined,
          position: { x: 100, y: currentY },
          size: { width: frameWidth, height: frameHeight },
        });

        // Move notes into the exact calculated positions
        positions.forEach(pos => {
          updateNote(pos.id, {
            position: { x: 100 + pos.x, y: currentY + pos.y }
          });
        });

        currentY += frameHeight + 80;
      });
      toast.success('Notes categorized into frames!');
      setIsOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'AI request failed');
    } finally {
      setLoadingType(null);
    }
  };

  const handleAutoColor = async () => {
    if (activeNotes.length === 0) {
      toast.error('No notes to color');
      return;
    }
    setLoadingType('autocolor');
    try {
      const payload = activeNotes.map(n => ({ id: n._id, title: n.title, content: n.content }));
      const res = await api.post('/ai/auto-color', { notes: payload });
      const colorUpdates = res.data.data;

      // Save backup before applying
      setAiBackup({
        type: 'color',
        previousColors: activeNotes.map(n => ({ id: n._id, color: n.color }))
      });

      // Optimistically update all notes at once for a satisfying visual effect
      const updatesPromises = colorUpdates.map((u: any) => updateNote(u.id, { color: u.color }));
      await Promise.all(updatesPromises);
      
      toast.success('Notes magically colored!');
      setIsOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'AI request failed');
    } finally {
      setLoadingType(null);
    }
  };

  const handleAutoConnect = async () => {
    if (activeNotes.length < 2) {
      toast.error('Need at least 2 notes to map');
      return;
    }
    setLoadingType('autoconnect');
    try {
      const payload = activeNotes.map(n => ({ id: n._id, title: n.title, content: n.content }));
      const res = await api.post('/ai/auto-connect', { notes: payload });
      const connections = res.data.data;

      if (connections.length === 0) {
        toast.error('No strong relationships found to connect.');
        setIsOpen(false);
        return;
      }

      // Save backup
      setAiBackup({
        type: 'connect',
        addedConnections: connections
      });

      // Add connections sequentially to avoid race conditions in backend/frontend state
      for (const conn of connections) {
        await addConnectionApi(conn.sourceId, conn.targetId);
      }
      
      toast.success(`Generated ${connections.length} mind map connections!`);
      setIsOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'AI request failed');
    } finally {
      setLoadingType(null);
    }
  };

  const handleRevert = async () => {
    if (!aiBackup) return;
    setLoadingType('revert');
    try {
      if (aiBackup.type === 'color' && aiBackup.previousColors) {
        const promises = aiBackup.previousColors.map(c => updateNote(c.id, { color: c.color }));
        await Promise.all(promises);
        toast.success('Restored previous colors!');
      } else if (aiBackup.type === 'connect' && aiBackup.addedConnections) {
        for (const conn of aiBackup.addedConnections) {
          await removeConnectionApi(conn.sourceId, conn.targetId);
        }
        toast.success('Removed AI mind-map connections!');
      }
      setAiBackup(null);
    } catch (e: any) {
      toast.error('Failed to revert AI action');
    } finally {
      setLoadingType(null);
    }
  };

  const handleSummarize = async () => {
    if (activeNotes.length === 0) {
      toast.error('No notes to summarize');
      return;
    }
    setLoadingType('summarize');
    try {
      const payload = activeNotes.map(n => ({ title: n.title, content: n.content }));
      const res = await api.post('/ai/summarize', { notes: payload });
      const summary = res.data.data.summary;

      addNote({
        title: '✨ AI Summary',
        content: summary,
        color: 'purple',
        boardId: activeBoardId || undefined,
        position: { x: 50, y: 50 },
        size: { width: 450, height: 450 },
      });

      toast.success('Summary generated!');
      setIsOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'AI request failed');
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <div className="relative flex items-center gap-2">
      {aiBackup && (
        <button
          onClick={handleRevert}
          disabled={!!loadingType}
          className="flex items-center justify-center gap-2 w-9 h-9 sm:w-auto sm:h-auto sm:px-4 sm:py-2 bg-gradient-to-r from-theme-primary via-theme-secondary to-theme-primary animate-magic-gradient text-white dark:text-slate-900 rounded-full font-semibold shadow-md hover:shadow-lg transition-all hover:scale-105 animate-in fade-in slide-in-from-right-2"
          title="Undo last AI Magic action"
        >
          {loadingType === 'revert' ? <Loader2 size={16} className="animate-spin text-white dark:text-slate-900" /> : <Undo2 size={16} className="text-white dark:text-slate-900" />}
          <span className="hidden sm:inline">Undo AI</span>
        </button>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center gap-2 w-9 h-9 sm:w-auto sm:h-auto sm:px-4 sm:py-2 bg-gradient-to-r from-theme-primary via-theme-secondary to-theme-primary animate-magic-gradient text-white dark:text-slate-900 rounded-full font-semibold shadow-md hover:shadow-lg transition-all hover:scale-105"
      >
        <Sparkles size={16} className="text-white dark:text-slate-900" />
        <span className="hidden sm:inline">AI Magic</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20 sm:bg-transparent backdrop-blur-sm sm:backdrop-blur-none" onClick={() => setIsOpen(false)} />
          <div className="fixed sm:absolute top-1/2 sm:top-full left-1/2 sm:left-auto right-auto sm:right-0 -translate-x-1/2 sm:translate-x-0 -translate-y-1/2 sm:translate-y-0 mt-0 sm:mt-3 w-[90vw] sm:w-80 max-w-sm bg-surface border border-border rounded-xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <BrainCircuit size={18} className="text-theme-primary" /> AI Tools
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-foreground/50 hover:text-foreground">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Brainstorm */}
              <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-lg border border-border">
                <p className="text-xs font-semibold text-foreground/70 mb-2 uppercase tracking-wide">Brainstorm Ideas</p>
                <input
                  type="text"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="e.g. Marketing Strategy"
                  className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-foreground mb-2 focus:outline-none focus:border-purple-500"
                />
                <button
                  onClick={handleBrainstorm}
                  disabled={!!loadingType}
                  className="w-full bg-theme-primary/10 text-theme-primary font-bold text-sm py-2 rounded-md hover:bg-theme-primary/20 transition-colors flex items-center justify-center gap-2"
                >
                  {loadingType === 'brainstorm' ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  Generate Notes
                </button>
              </div>

              {/* Categorize */}
              <button
                onClick={handleCategorize}
                disabled={!!loadingType}
                className="w-full flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/5 hover:bg-green-500/5 border border-border hover:border-green-500/30 rounded-lg transition-colors text-left"
              >
                <div className="bg-green-100 dark:bg-green-500/20 text-green-500 p-2 rounded-md">
                  {loadingType === 'categorize' ? <Loader2 size={16} className="animate-spin" /> : <LayoutGrid size={16} />}
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">Auto-Categorize</p>
                  <p className="text-xs text-foreground/60">Group messy notes into frames</p>
                </div>
              </button>

              {/* Auto Color */}
              <button
                onClick={handleAutoColor}
                disabled={!!loadingType}
                className="w-full flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/5 hover:bg-red-500/5 border border-border hover:border-red-500/30 rounded-lg transition-colors text-left"
              >
                <div className="bg-red-100 dark:bg-red-500/20 text-red-500 p-2 rounded-md">
                  {loadingType === 'autocolor' ? <Loader2 size={16} className="animate-spin" /> : <Palette size={16} />}
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">Smart Color Coding</p>
                  <p className="text-xs text-foreground/60">Color by priority & intent</p>
                </div>
              </button>

              {/* Auto Connect */}
              <button
                onClick={handleAutoConnect}
                disabled={!!loadingType}
                className="w-full flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/5 hover:bg-blue-500/5 border border-border hover:border-blue-500/30 rounded-lg transition-colors text-left"
              >
                <div className="bg-blue-100 dark:bg-blue-500/20 text-blue-500 p-2 rounded-md">
                  {loadingType === 'autoconnect' ? <Loader2 size={16} className="animate-spin" /> : <GitMerge size={16} />}
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">Auto Mind-Map</p>
                  <p className="text-xs text-foreground/60">Draw arrows between related notes</p>
                </div>
              </button>

              {/* Summarize */}
              <button
                onClick={handleSummarize}
                disabled={!!loadingType}
                className="w-full flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/5 hover:bg-yellow-500/5 border border-border hover:border-yellow-500/30 rounded-lg transition-colors text-left"
              >
                <div className="bg-yellow-100 dark:bg-yellow-500/20 text-yellow-500 p-2 rounded-md">
                  {loadingType === 'summarize' ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">Summarize Board</p>
                  <p className="text-xs text-foreground/60">Generate a summary of all notes</p>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
