import { useUIStore } from '@/store/useUIStore';
import { MousePointer2, Hand, TrendingUp, Wand2, HelpCircle } from 'lucide-react';
import { useEffect, useRef } from 'react';

export default function Toolbar() {
  const { toolMode, setToolMode } = useUIStore();
  const previousModeRef = useRef<'move' | 'hand' | 'laser' | 'arrow'>('move');
  const isSpaceDown = useRef(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || (e.target as HTMLElement).isContentEditable) return;
      
      if (e.code === 'Space' && !isSpaceDown.current) {
        e.preventDefault();
        isSpaceDown.current = true;
        previousModeRef.current = useUIStore.getState().toolMode;
        setToolMode('hand');
      } else if (e.key.toLowerCase() === 'v') {
        setToolMode('move');
      } else if (e.key.toLowerCase() === 'h') {
        setToolMode('hand');
      } else if (e.key.toLowerCase() === 'x' || e.key.toLowerCase() === 'c') {
        setToolMode('arrow');
      } else if (e.key.toLowerCase() === 'a' || e.key.toLowerCase() === 'l') {
        setToolMode('laser');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        isSpaceDown.current = false;
        setToolMode(previousModeRef.current);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [setToolMode]);

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white dark:bg-surface shadow-2xl border border-border p-1.5 rounded-xl flex items-center gap-1 z-50 animate-in slide-in-from-bottom-5 pointer-events-auto">
      <button
        onClick={() => setToolMode('move')}
        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${toolMode === 'move' ? 'bg-theme-primary text-white shadow-md' : 'text-foreground/70 hover:bg-input-bg hover:text-foreground'}`}
        title="Move (V)"
      >
        <MousePointer2 size={20} className={toolMode === 'move' ? 'fill-white/80' : ''} />
      </button>
      <button
        onClick={() => setToolMode('hand')}
        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${toolMode === 'hand' ? 'bg-theme-primary text-white shadow-md' : 'text-foreground/70 hover:bg-input-bg hover:text-foreground'}`}
        title="Hand Tool (H / Hold Space)"
      >
        <Hand size={18} className={toolMode === 'hand' ? 'fill-white/80' : ''} />
      </button>

      <div className="w-px h-6 bg-border mx-1" />

      <button
        onClick={() => setToolMode('arrow')}
        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${toolMode === 'arrow' ? 'bg-theme-primary text-white shadow-md' : 'text-foreground/70 hover:bg-input-bg hover:text-foreground'}`}
        title="Connector Tool (X or C)"
      >
        <TrendingUp size={18} />
      </button>
      <button
        onClick={() => setToolMode('laser')}
        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${toolMode === 'laser' ? 'bg-theme-primary text-white shadow-md' : 'text-foreground/70 hover:bg-input-bg hover:text-foreground'}`}
        title="Laser Pointer (A or L)"
      >
        <Wand2 size={18} />
      </button>

      <div className="w-px h-6 bg-border mx-1" />

      <div className="relative group">
        <button className="w-8 h-8 rounded-xl flex items-center justify-center text-foreground/40 hover:text-foreground hover:bg-input-bg transition-colors">
          <HelpCircle size={18} />
        </button>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-surface border border-border rounded-xl shadow-xl p-3 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity text-xs z-[100]">
          <p className="font-semibold mb-2">Shortcuts</p>
          <div className="flex justify-between py-1 border-b border-border"><span className="text-foreground/60">Move</span><span className="font-mono">V</span></div>
          <div className="flex justify-between py-1 border-b border-border"><span className="text-foreground/60">Hand</span><span className="font-mono">H / Space</span></div>
          <div className="flex justify-between py-1 border-b border-border"><span className="text-foreground/60">Connector</span><span className="font-mono">X / C</span></div>
          <div className="flex justify-between py-1 border-b border-border"><span className="text-foreground/60">Laser</span><span className="font-mono">A / L</span></div>
          <div className="flex justify-between py-1"><span className="text-foreground/60">Help Menu</span><span className="font-mono">?</span></div>
        </div>
      </div>
    </div>
  );
}
