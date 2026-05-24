"use client";

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/useAuthStore';

interface RemoteCursor {
  userId: string;
  name: string;
  x: number;
  y: number;
}

const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#ef4444'];

function getUserColor(userId: string) {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

interface RemoteCursorsProps {
  boardId: string | null;
  pan: { x: number; y: number };
  scale: number;
}

/**
 * Renders other users' cursors as floating labels on the canvas.
 */
export default function RemoteCursors({ boardId, pan, scale }: RemoteCursorsProps) {
  const [cursors, setCursors] = useState<Record<string, RemoteCursor>>({});
  const token = useAuthStore.getState().token;

  useEffect(() => {
    if (!token) return;

    const socket: Socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket'],
    });

    const room = boardId || 'default';
    socket.emit('join-board', room);

    socket.on('remote-cursor', (data: RemoteCursor) => {
      setCursors((prev) => ({ ...prev, [data.userId]: data }));
    });

    socket.on('user-left', ({ userId }: { userId: string }) => {
      setCursors((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
    });

    return () => {
      socket.emit('leave-board', room);
      socket.disconnect();
    };
  }, [boardId, token]);

  return (
    <>
      {Object.values(cursors).map((cursor) => {
        const color = getUserColor(cursor.userId);
        // Transform canvas coords → screen coords
        const screenX = cursor.x * scale + pan.x;
        const screenY = cursor.y * scale + pan.y;

        return (
          <div
            key={cursor.userId}
            className="pointer-events-none absolute z-50 transition-all duration-100"
            style={{ left: screenX, top: screenY }}
          >
            {/* Cursor dot */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill={color} className="drop-shadow-md">
              <path d="M5.5 3.5L19 12.5L12 13.5L8.5 20L5.5 3.5Z" />
            </svg>
            {/* Name label */}
            <div
              className="absolute top-4 left-3 text-[11px] font-semibold text-white px-2 py-0.5 rounded-full shadow-md whitespace-nowrap"
              style={{ background: color }}
            >
              {cursor.name}
            </div>
          </div>
        );
      })}
    </>
  );
}
