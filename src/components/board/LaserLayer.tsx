"use client";

import { useEffect, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useAuthStore } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';

interface LaserPoint {
  x: number;
  y: number;
  id: number;
  alpha: number;
  userId: string;
}

export default function LaserLayer({ boardId, scale, pan, canvasRef }: { boardId: string | null; scale: number; pan: {x: number, y: number}, canvasRef: React.RefObject<HTMLDivElement> }) {
  const [laserPoints, setLaserPoints] = useState<LaserPoint[]>([]);
  const toolMode = useUIStore(state => state.toolMode);
  const isLaserMode = toolMode === 'laser';
  const { emitCursorMove, socket } = useSocket(boardId);
  const currentUser = useAuthStore(state => state.user);

  useEffect(() => {
    let pointId = 0;
    
    // Local laser
    const onMove = (e: PointerEvent) => {
      if (!isLaserMode || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / scale;
      const y = (e.clientY - rect.top - pan.y) / scale;
      
      setLaserPoints(prev => [...prev, { x, y, id: pointId++, alpha: 1, userId: currentUser?._id || 'me' }]);
      emitCursorMove(x, y, true);
    };
    
    document.addEventListener('pointermove', onMove);
    
    // Remote laser
    const handleRemoteCursor = (data: any) => {
      if (data.isLaser) {
        setLaserPoints(prev => [...prev, { x: data.x, y: data.y, id: pointId++, alpha: 1, userId: data.userId }]);
      }
    };
    
    if (socket.current) {
      socket.current.on('remote-cursor', handleRemoteCursor);
    }
    
    return () => {
      document.removeEventListener('pointermove', onMove);
      if (socket.current) {
        socket.current.off('remote-cursor', handleRemoteCursor);
      }
    };
  }, [isLaserMode, scale, pan, canvasRef, emitCursorMove, socket, currentUser]);

  // Decay loop
  useEffect(() => {
    let rafId: number;
    const loop = () => {
      setLaserPoints(prev => {
        const next = prev.map(p => ({ ...p, alpha: p.alpha - 0.05 })).filter(p => p.alpha > 0);
        return next.length !== prev.length || next.some((p, i) => p.alpha !== prev[i].alpha) ? next : prev;
      });
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Group by user
  const linesByUser = laserPoints.reduce((acc, point) => {
    if (!acc[point.userId]) acc[point.userId] = [];
    acc[point.userId].push(point);
    return acc;
  }, {} as Record<string, LaserPoint[]>);

  return (
    <svg className="absolute inset-0 w-[10000px] h-[10000px] pointer-events-none z-[60]" style={{ overflow: 'visible' }}>
      {Object.entries(linesByUser).map(([userId, points]) => (
        <polyline
          key={userId}
          points={points.map(p => `${p.x},${p.y}`).join(' ')}
          fill="none"
          stroke={userId === currentUser?._id ? "#ef4444" : "#3b82f6"}
          strokeWidth={4 / scale}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: `drop-shadow(0 0 5px ${userId === currentUser?._id ? 'rgba(239, 68, 68, 0.8)' : 'rgba(59, 130, 246, 0.8)'})` }}
        />
      ))}
    </svg>
  );
}
