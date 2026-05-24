"use client";

import { Note } from '@/store/useNotesStore';

interface MinimapProps {
  notes: Note[];
  pan: { x: number; y: number };
  scale: number;
  canvasWidth: number;
  canvasHeight: number;
  onTeleport: (pan: { x: number; y: number }) => void;
}

const MINIMAP_W = 180;
const MINIMAP_H = 120;
const CANVAS_VIRTUAL_W = 3000;
const CANVAS_VIRTUAL_H = 2000;

export default function Minimap({ notes, pan, scale, onTeleport }: MinimapProps) {
  const scaleX = MINIMAP_W / CANVAS_VIRTUAL_W;
  const scaleY = MINIMAP_H / CANVAS_VIRTUAL_H;

  // Viewport rect in minimap coords
  const vpW = (typeof window !== 'undefined' ? window.innerWidth : 1200) / scale;
  const vpH = (typeof window !== 'undefined' ? window.innerHeight : 800) / scale;
  const vpX = (-pan.x / scale) * scaleX;
  const vpY = (-pan.y / scale) * scaleY;
  const vpW2 = (vpW * scaleX);
  const vpH2 = (vpH * scaleY);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const canvasX = mx / scaleX;
    const canvasY = my / scaleY;
    const winW = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const winH = typeof window !== 'undefined' ? window.innerHeight : 800;
    onTeleport({ x: -canvasX * scale + (winW / 2), y: -canvasY * scale + (winH / 2) });
  };

  return (
    <div
      className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-30 rounded-xl overflow-hidden cursor-pointer select-none shadow-xl border border-white/20 scale-75 sm:scale-100 origin-bottom-right transition-transform"
      style={{ width: MINIMAP_W, height: MINIMAP_H, background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)' }}
      onClick={handleClick}
      title="Minimap — click to teleport"
    >
      {/* Notes as dots */}
      {notes.map((note) => (
        <div
          key={note._id}
          className="absolute rounded-sm"
          style={{
            left: Math.max(0, note.position.x * scaleX),
            top:  Math.max(0, note.position.y * scaleY),
            width: Math.max(4, note.size.width * scaleX),
            height: Math.max(4, note.size.height * scaleY),
            background: getNoteColor(note.color),
            opacity: 0.85,
          }}
        />
      ))}

      {/* Viewport rect */}
      <div
        className="absolute border border-white/60 rounded-sm pointer-events-none"
        style={{
          left:   Math.max(0, vpX),
          top:    Math.max(0, vpY),
          width:  Math.min(MINIMAP_W, vpW2),
          height: Math.min(MINIMAP_H, vpH2),
          background: 'rgba(255,255,255,0.08)',
        }}
      />

      <div className="absolute bottom-1 left-2 text-[9px] text-white/50 font-medium tracking-wide pointer-events-none select-none">MINIMAP</div>
    </div>
  );
}

function getNoteColor(color: string): string {
  const map: Record<string, string> = {
    yellow: '#fef6ca', blue: '#e3f0fe', pink: '#ffcce5',
    green: '#c5ead1', purple: '#e2c1f3', xanthous: '#F7B538',
    golden: '#FEC700', power: '#C3D809',
    sunset: '#fcb69f', ocean: '#8ec5fc', aurora: '#96e6a1',
  };
  return map[color] || '#e2e8f0';
}
