"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { useNotesStore } from '@/store/useNotesStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useBoardStore } from '@/store/useBoardStore';
import { usePathname } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';
import StickyNote from './StickyNote';
import ShareModal from './note/ShareModal';
import Minimap from './Minimap';
import ArrowLayer, { addConnectionApi } from './ArrowLayer';
import RemoteCursors from './RemoteCursors';
import { exportAsPng, exportAsPdf } from '@/lib/exportBoard';
import { Download, FileImage } from 'lucide-react';

export default function Canvas() {
  const notes        = useNotesStore(state => state.notes);
  const fetchNotes   = useNotesStore(state => state.fetchNotes);
  const user         = useAuthStore(state => state.user);
  const activeBoardId = useBoardStore(state => state.activeBoardId);

  // ── Derive view from URL ──────────────────────────────────────────────────
  const pathname = usePathname();
  let currentView: 'active' | 'archived' | 'trashed' | 'shared' = 'active';
  if (pathname.includes('/archived')) currentView = 'archived';
  else if (pathname.includes('/trashed')) currentView = 'trashed';
  else if (pathname.includes('/shared')) currentView = 'shared';

  // ── Canvas state ──────────────────────────────────────────────────────────
  const canvasRef    = useRef<HTMLDivElement>(null);
  const innerRef     = useRef<HTMLDivElement>(null);
  const [pan, setPan]     = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [isPanning, setIsPanning] = useState(false);

  // ── Shared tab state ──────────────────────────────────────────────────────
  const [sharedTab, setSharedTab] = useState<'with_me' | 'by_me'>('with_me');

  // ── Mind-map connection mode ──────────────────────────────────────────────
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);

  const handleConnectStart = (noteId: string) => setConnectingFrom(noteId);
  const handleConnectEnd = useCallback(async (targetId: string) => {
    if (!connectingFrom || connectingFrom === targetId) { setConnectingFrom(null); return; }
    await addConnectionApi(connectingFrom, targetId);
    setConnectingFrom(null);
  }, [connectingFrom]);

  // ── Socket.io ─────────────────────────────────────────────────────────────
  const { emitNoteMove, emitNoteUpdate, emitCursorMove } = useSocket(activeBoardId);

  // ── Fetch notes when view or board changes ────────────────────────────────
  useEffect(() => {
    fetchNotes(currentView, activeBoardId);
  }, [fetchNotes, currentView, activeBoardId]);

  // ── Esc to cancel connection mode ────────────────────────────────────────
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') setConnectingFrom(null); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // ── Wheel handler (zoom + pan) ────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey) {
        const delta = Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY), 60);
        setScale(prev => Math.min(Math.max(0.2, prev - delta * 0.0015 * prev), 3));
      } else {
        setPan(prev => ({ x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
      }
    };

    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', onWheel);
  }, []);

  // ── Pointer drag (pan) + cursor emit ─────────────────────────────────────
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 1 && !(e.target as HTMLElement).hasAttribute('data-canvas')) return;
    e.preventDefault();
    setIsPanning(true);
    const startX = e.clientX - pan.x;
    const startY = e.clientY - pan.y;

    const onMove = (e: PointerEvent) => {
      const newPan = { x: e.clientX - startX, y: e.clientY - startY };
      setPan(newPan);
      // Emit cursor position in canvas space
      emitCursorMove((e.clientX - newPan.x) / scale, (e.clientY - newPan.y) / scale);
    };
    const onUp = () => {
      setIsPanning(false);
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  };

  // ── Export helpers ────────────────────────────────────────────────────────
  const handleExportPng = async () => {
    if (canvasRef.current) await exportAsPng(canvasRef.current);
  };
  const handleExportPdf = async () => {
    if (canvasRef.current) await exportAsPdf(canvasRef.current);
  };

  // ═════════════════════════════ GRID VIEW ════════════════════════════════
  if (currentView !== 'active') {
    let displayedNotes = notes;
    if (currentView === 'shared') {
      displayedNotes = notes.filter(note => {
        const ownerId = typeof note.userId === 'object' ? note.userId?._id : note.userId;
        return sharedTab === 'by_me' ? ownerId === user?._id : ownerId !== user?._id;
      });
    }

    return (
      <div className="w-full h-full overflow-y-auto bg-slate-50 dark:bg-background relative flex flex-col items-center">
        {/* Shared toggle */}
        {currentView === 'shared' && (
          <div className="sticky top-6 z-20 mb-2 bg-white/80 dark:bg-surface/80 backdrop-blur-md shadow-sm border border-slate-200/60 dark:border-border p-1 rounded-full flex items-center gap-1 w-[320px]">
            {(['with_me', 'by_me'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setSharedTab(tab)}
                className={`flex-1 text-sm font-medium py-2 rounded-full transition-all duration-200 ${sharedTab === tab ? 'bg-theme-primary text-white shadow-md' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'}`}
              >
                {tab === 'with_me' ? 'Shared with you' : 'You Shared'}
              </button>
            ))}
          </div>
        )}

        <div className="p-8 w-full max-w-[1600px]">
          <div className="flex flex-wrap items-start gap-6">
            {displayedNotes.map(note => (
              <StickyNote key={note._id} note={note} isGridMode={true} />
            ))}
            {displayedNotes.length === 0 && (
              <div className="w-full h-[400px] flex items-center justify-center">
                <div className="text-center opacity-50">
                  <p className="text-lg font-medium text-slate-800 dark:text-foreground">No notes found</p>
                  <p className="text-sm text-slate-500 mt-1">
                    {currentView === 'shared'
                      ? (sharedTab === 'with_me' ? 'No one has shared any notes with you yet.' : "You haven't shared any notes yet.")
                      : currentView === 'archived' ? "You haven't archived any notes."
                      : currentView === 'trashed'  ? 'Your trash is empty.'
                      : 'No notes here.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        <ShareModal />
      </div>
    );
  }

  // ═════════════════════════════ CANVAS VIEW ═══════════════════════════════
  return (
    <div
      ref={canvasRef}
      className="w-full h-full overflow-hidden absolute inset-0"
      onPointerDown={handlePointerDown}
      style={{ touchAction: 'none', cursor: isPanning ? 'grabbing' : 'grab' }}
      data-canvas="true"
    >
      {/* Transform layer */}
      <div
        ref={innerRef}
        className="origin-top-left transition-transform duration-75 will-change-transform"
        data-canvas="true"
        style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`, width: '100vw', height: '100vh' }}
      >
        {/* SVG Arrow connections */}
        <ArrowLayer notes={notes} pan={pan} scale={scale} />

        {/* Sticky notes */}
        {notes.map(note => (
          <StickyNote
            key={note._id}
            note={note}
            isConnecting={connectingFrom !== null && connectingFrom !== note._id}
            onConnectStart={handleConnectStart}
            onConnectEnd={handleConnectEnd}
            emitNoteMove={emitNoteMove}
            emitNoteUpdate={emitNoteUpdate}
          />
        ))}

        {/* Remote collaborator cursors */}
        <div data-html2canvas-ignore="true">
          <RemoteCursors boardId={activeBoardId} pan={pan} scale={scale} />
        </div>
      </div>

      {/* Minimap */}
      <div data-html2canvas-ignore="true">
        <Minimap
          notes={notes}
          pan={pan}
          scale={scale}
          canvasWidth={typeof window !== 'undefined' ? window.innerWidth : 1200}
          canvasHeight={typeof window !== 'undefined' ? window.innerHeight : 800}
          onTeleport={setPan}
        />
      </div>

      {/* Export buttons */}
      <div data-html2canvas-ignore="true" className="absolute top-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-surface/80 backdrop-blur-md border border-border rounded-full px-3 py-1.5 shadow-lg opacity-0 hover:opacity-100 transition-opacity duration-300">
        <button onClick={handleExportPng} className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full hover:bg-input-bg transition-colors text-foreground/70">
          <FileImage size={14} /> PNG
        </button>
        <div className="w-px h-4 bg-border" />
        <button onClick={handleExportPdf} className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full hover:bg-input-bg transition-colors text-foreground/70">
          <Download size={14} /> PDF
        </button>
      </div>

      {/* Connection mode indicator */}
      {connectingFrom && (
        <div data-html2canvas-ignore="true" className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-full shadow-lg animate-bounce">
          Click another note to draw an arrow — or press Esc to cancel
        </div>
      )}

      <div data-html2canvas-ignore="true">
        <ShareModal />
      </div>
    </div>
  );
}
