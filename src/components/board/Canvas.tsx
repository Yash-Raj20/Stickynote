"use client";

import { useEffect, useRef, useState, useCallback, Suspense } from 'react';
import { useNotesStore } from '@/store/useNotesStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useBoardStore } from '@/store/useBoardStore';
import { usePathname, useSearchParams } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';
import StickyNote from './StickyNote';
import ShareModal from './note/ShareModal';
import Minimap from './Minimap';
import ArrowLayer, { addConnectionApi } from './ArrowLayer';
import RemoteCursors from './RemoteCursors';
import LaserLayer from './LaserLayer';
import BoardTopBar from './BoardTopBar';
import { useUIStore } from '@/store/useUIStore';
import { exportAsPng, exportAsPdf } from '@/lib/exportBoard';
import { Download, FileImage } from 'lucide-react';
import Toolbar from './Toolbar';

function CanvasContent() {
  const notes = useNotesStore(state => state.notes);
  const fetchNotes = useNotesStore(state => state.fetchNotes);
  const user = useAuthStore(state => state.user);
  const activeBoardId = useBoardStore(state => state.activeBoardId);
  const setActiveBoardId = useBoardStore(state => state.setActiveBoardId);
  const searchParams = useSearchParams();

  // ── Auto-select board from URL parameter ────────────────────────────────
  useEffect(() => {
    const urlBoardId = searchParams.get('boardId');
    if (urlBoardId && urlBoardId !== activeBoardId) {
      setActiveBoardId(urlBoardId);
    }
  }, [searchParams, activeBoardId, setActiveBoardId]);

  // ── Derive view from URL ──────────────────────────────────────────────────
  const pathname = usePathname();
  let currentView: 'active' | 'archived' | 'trashed' | 'shared' = 'active';
  if (pathname.includes('/archived')) currentView = 'archived';
  else if (pathname.includes('/trashed')) currentView = 'trashed';
  else if (pathname.includes('/shared')) currentView = 'shared'; 

  // ── Canvas state ──────────────────────────────────────────────────────────
  const canvasRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const guides = useUIStore(state => state.guides);
  const toolMode = useUIStore(state => state.toolMode);

  // ── Shared tab state ──────────────────────────────────────────────────────
  const [sharedTab, setSharedTab] = useState<'with_me' | 'by_me'>('with_me');

  // ── Mind-map connection mode ──────────────────────────────────────────────
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);

  // ── Pinch to zoom state ───────────────────────────────────────────────────
  const touchStartRef = useRef<{ dist: number, scale: number, center: { x: number, y: number } }>({ dist: 0, scale: 1, center: { x: 0, y: 0 } });

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

  // ── Wheel & Touch handler (zoom + pan) ───────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onWheel = (e: WheelEvent) => {
      // Ignore wheel events if they originate from inside the text editor or a scrollable area
      if ((e.target as HTMLElement).closest('.tiptap-editor, .custom-scrollbar, .overflow-y-auto')) {
        return;
      }

      e.preventDefault();
      if (e.ctrlKey) {
        const delta = Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY), 60);
        setScale(prev => Math.min(Math.max(0.2, prev - delta * 0.0015 * prev), 3));
      } else {
        setPan(prev => ({ x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);

        setScale(currentScale => {
          touchStartRef.current = { dist, scale: currentScale, center: { x: 0, y: 0 } };
          return currentScale;
        });
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);

        const initial = touchStartRef.current;
        if (initial.dist > 0) {
          const delta = dist / initial.dist;
          const newScale = Math.min(Math.max(0.2, initial.scale * delta), 3);
          setScale(newScale);
        }
      }
    };

    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });

    return () => {
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  // ── Pointer drag (pan) ───────────────────────────────────────────────────
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 1 && !(e.target as HTMLElement).hasAttribute('data-canvas')) return;
    e.preventDefault();
    setIsPanning(true);
    const startX = e.clientX - pan.x;
    const startY = e.clientY - pan.y;

    const onMove = (e: PointerEvent) => {
      setPan({ x: e.clientX - startX, y: e.clientY - startY });
    };
    const onUp = () => {
      setIsPanning(false);
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  };

  // ── Emit cursor on normal move ───────────────────────────────────────────
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!canvasRef.current) return;
    // Don't emit if panning to save performance, or we can emit anyway.
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / scale;
    const y = (e.clientY - rect.top - pan.y) / scale;

    // Throttle emitting slightly by ignoring tiny movements if needed, but for now just emit
    emitCursorMove(x, y);
  };

  // ── Export helpers ────────────────────────────────────────────────────────
  const handleExportPng = async () => {
    if (canvasRef.current) await exportAsPng(canvasRef.current);
  };
  const handleExportPdf = async () => {
    if (canvasRef.current) await exportAsPdf(canvasRef.current);
  };

  // Zoom helpers
  const handleZoomIn = () => setScale(s => Math.min(3, Math.floor(s * 10 + 1) / 10));
  const handleZoomOut = () => setScale(s => Math.max(0.1, Math.ceil(s * 10 - 1) / 10));
  const handleResetZoom = () => { setScale(1); setPan({ x: 0, y: 0 }); };
  const handleFitScreen = () => {
    if (!notes.length) { setScale(1); setPan({ x: 0, y: 0 }); return; }
    const minX = Math.min(...notes.map(n => n.position.x));
    const minY = Math.min(...notes.map(n => n.position.y));
    const maxX = Math.max(...notes.map(n => n.position.x + (n.size?.width || 250)));
    const maxY = Math.max(...notes.map(n => n.position.y + (n.size?.height || 250)));

    const W = canvasRef.current ? canvasRef.current.clientWidth : window.innerWidth - 240;
    const H = canvasRef.current ? canvasRef.current.clientHeight : window.innerHeight - 80;

    const padding = 80;
    const notesWidth = maxX - minX;
    const notesHeight = maxY - minY;

    const scaleX = (W - padding * 2) / notesWidth;
    const scaleY = (H - padding * 2) / notesHeight;
    let s = Math.min(scaleX, scaleY, 1.5);
    s = Math.max(0.1, s);

    const panX = (W / 2) - ((minX + notesWidth / 2) * s);
    const panY = (H / 2) - ((minY + notesHeight / 2) * s);

    setScale(Math.round(s * 100) / 100);
    setPan({ x: Math.round(panX), y: Math.round(panY) });
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
                        : currentView === 'trashed' ? 'Your trash is empty.'
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
      onPointerMove={handlePointerMove}
      style={{ touchAction: 'none', cursor: isPanning ? 'grabbing' : (toolMode === 'hand' ? 'grab' : (toolMode === 'arrow' ? 'crosshair' : 'default')) }}
      data-canvas="true"
    >
      {/* Transform layer */}
      <div
        ref={innerRef}
        className="origin-top-left transition-transform duration-75 will-change-transform"
        data-canvas="true"
        style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`, width: '100vw', height: '100vh', pointerEvents: toolMode === 'hand' ? 'none' : 'auto' }}
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

        <div data-html2canvas-ignore="true">
          <RemoteCursors boardId={activeBoardId} pan={pan} scale={scale} />
          <LaserLayer boardId={activeBoardId} scale={scale} pan={pan} canvasRef={canvasRef} />
        </div>

        {/* Smart Alignment Guides */}
        {guides.map((g, i) => (
          <div
            key={i}
            className="absolute z-[100] pointer-events-none"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.7)', // red-500 with opacity
              left: g.axis === 'x' ? g.pos : -10000,
              top: g.axis === 'y' ? g.pos : -10000,
              width: g.axis === 'y' ? 20000 : 1.5,
              height: g.axis === 'x' ? 20000 : 1.5,
            }}
          />
        ))}
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

      {/* ── Figma-style Top Bar ── */}
      <div data-html2canvas-ignore="true">
        <BoardTopBar
          scale={scale}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onFitScreen={handleFitScreen}
          onResetZoom={handleResetZoom}
          onExportPng={handleExportPng}
          onExportPdf={handleExportPdf}
        />
      </div>

      {/* Connection mode indicator */}
      {connectingFrom && (
        <div data-html2canvas-ignore="true" className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-full shadow-lg animate-bounce">
          Click another note to draw an arrow — or press Esc to cancel
        </div>
      )}

      <div data-html2canvas-ignore="true">
        <ShareModal />
      </div>

      <div data-html2canvas-ignore="true">
        <Toolbar />
      </div>
    </div>
  );
}

export default function Canvas() {
  return (
    <Suspense fallback={<div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-background">Loading board...</div>}>
      <CanvasContent />
    </Suspense>
  );
}
