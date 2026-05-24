"use client";

import { Note } from '@/store/useNotesStore';
import { useNotesStore } from '@/store/useNotesStore';
import api from '@/lib/api';
import { useState } from 'react';

interface ArrowLayerProps {
  notes: Note[];
  pan: { x: number; y: number };
  scale: number;
}

/**
 * SVG overlay that draws bezier-curve arrows between connected notes.
 * Rendered on top of all notes inside the canvas transform div.
 */
export default function ArrowLayer({ notes, pan, scale }: ArrowLayerProps) {
  const connections: { from: Note; to: Note }[] = [];
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  notes.forEach((note) => {
    if (!note.connections?.length) return;
    note.connections.forEach((conn) => {
      const target = notes.find((n) => n._id === conn.targetId);
      if (target) connections.push({ from: note, to: target });
    });
  });

  if (connections.length === 0) return null;

  return (
    <>
      {/* SVG Layer for the connection lines (behind notes) */}
      <svg
        className="absolute inset-0 pointer-events-none overflow-visible"
        style={{ width: '100%', height: '100%', zIndex: 5 }}
      >
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        {connections.map(({ from, to }, i) => {
          const isFromLeft = (from.position.x + from.size.width / 2) < (to.position.x + to.size.width / 2);
          const x1 = isFromLeft ? from.position.x + from.size.width : from.position.x;
          const x2 = isFromLeft ? to.position.x : to.position.x + to.size.width;
          const y1 = from.position.y + from.size.height / 2;
          const y2 = to.position.y + to.size.height / 2;
          const distance = Math.max(Math.abs(x2 - x1) / 2, 50);
          const cx1 = isFromLeft ? x1 + distance : x1 - distance;
          const cx2 = isFromLeft ? x2 - distance : x2 + distance;

          return (
            <g 
              key={i} 
              style={{ pointerEvents: 'auto', cursor: 'pointer' }} 
              onClick={() => removeConnectionApi(from._id, to._id)}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <path
                d={`M ${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`}
                fill="none"
                stroke="transparent"
                strokeWidth={20}
              />
              <path
                d={`M ${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`}
                fill="none"
                className={`transition-colors duration-200 ${hoveredIndex === i ? 'stroke-red-500' : 'stroke-indigo-500/80'}`}
                strokeWidth={2.5}
                strokeLinecap="round"
                filter="url(#glow)"
              />

              {/* Animated Light Particle travelling along the path */}
              <g>
                <circle r="4" className="fill-indigo-500 dark:fill-white" opacity="0.8" filter="url(#glow)" />
                <circle r="1.5" className="fill-white" />
                <animateMotion
                  dur="2.5s"
                  repeatCount="indefinite"
                  path={`M ${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`}
                />
                <animate 
                  attributeName="opacity" 
                  values="0;1;1;0" 
                  keyTimes="0;0.1;0.9;1" 
                  dur="2.5s" 
                  repeatCount="indefinite" 
                />
              </g>
            </g>
          );
        })}
      </svg>

      {/* SVG Layer for the hover badges (in front of notes) */}
      <svg
        className="absolute inset-0 pointer-events-none overflow-visible"
        style={{ width: '100%', height: '100%', zIndex: 60 }}
      >
        {connections.map(({ from, to }, i) => {
          if (hoveredIndex !== i) return null;

          const isFromLeft = (from.position.x + from.size.width / 2) < (to.position.x + to.size.width / 2);
          const x1 = isFromLeft ? from.position.x + from.size.width : from.position.x;
          const x2 = isFromLeft ? to.position.x : to.position.x + to.size.width;
          const y1 = from.position.y + from.size.height / 2;
          const y2 = to.position.y + to.size.height / 2;
          const midX = (x1 + x2) / 2;
          const midY = (y1 + y2) / 2;

          return (
            <g key={`badge-${i}`} style={{ transform: `translate(${midX}px, ${midY}px)` }}>
              <rect x="-60" y="-12" width="120" height="24" rx="12" fill="#ef4444" className="drop-shadow-md" />
              <text x="0" y="4" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" letterSpacing="0.5" style={{ fontFamily: 'sans-serif' }}>
                Remove Connection
              </text>
            </g>
          );
        })}
      </svg>
    </>
  );
}

/** Removes a connection from the backend and updates local state optimistically */
export const removeConnectionApi = async (noteId: string, targetId: string) => {
  try {
    const res = await api.delete(`/notes/${noteId}/connect/${targetId}`);
    useNotesStore.setState((state) => ({
      notes: state.notes.map((n) => (n._id === noteId ? res.data.data : n)),
    }));
  } catch (error) {
    console.error('Failed to remove connection', error);
  }
};

/** Adds a connection via backend */
export const addConnectionApi = async (noteId: string, targetId: string) => {
  try {
    const res = await api.post(`/notes/${noteId}/connect`, { targetId });
    useNotesStore.setState((state) => ({
      notes: state.notes.map((n) => (n._id === noteId ? res.data.data : n)),
    }));
  } catch (error) {
    console.error('Failed to add connection', error);
  }
};
