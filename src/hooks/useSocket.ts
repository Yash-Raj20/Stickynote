"use client";

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/useAuthStore';
import { useNotesStore } from '@/store/useNotesStore';

let socketInstance: Socket | null = null;

/**
 * Connects to Socket.io server and wires up all real-time collaboration events.
 * Call this once per board view.
 */
export const useSocket = (boardId: string | null) => {
  const token = useAuthStore.getState().token;
  const socketRef = useRef<Socket | null>(null);

  const applyRemoteMove = useCallback((noteId: string, position: { x: number; y: number }) => {
    useNotesStore.setState((state) => ({
      notes: state.notes.map((n) => (n._id === noteId ? { ...n, position } : n)),
    }));
  }, []);

  const applyRemoteUpdate = useCallback((noteId: string, updates: Record<string, any>) => {
    useNotesStore.setState((state) => ({
      notes: state.notes.map((n) => (n._id === noteId ? { ...n, ...updates } : n)),
    }));
  }, []);

  const applyRemoteCreate = useCallback((note: any) => {
    useNotesStore.setState((state) => ({
      notes: [...state.notes, note],
    }));
  }, []);

  const applyRemoteDelete = useCallback((noteId: string) => {
    useNotesStore.setState((state) => ({
      notes: state.notes.filter((n) => n._id !== noteId),
    }));
  }, []);

  useEffect(() => {
    if (!token) return;

    // Reuse existing socket or create a new one
    if (!socketInstance) {
      socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
        auth: { token },
        transports: ['websocket'],
      });
    }

    socketRef.current = socketInstance;

    // Join the board room (or global room if boardId is null)
    const room = boardId || 'default';
    socketRef.current.emit('join-board', room);

    // Wire up remote events
    socketRef.current.on('remote-note-moved', ({ noteId, position }) => applyRemoteMove(noteId, position));
    socketRef.current.on('remote-note-updated', ({ noteId, updates }) => applyRemoteUpdate(noteId, updates));
    socketRef.current.on('remote-note-created', ({ note }) => applyRemoteCreate(note));
    socketRef.current.on('remote-note-deleted', ({ noteId }) => applyRemoteDelete(noteId));

    return () => {
      socketRef.current?.emit('leave-board', room);
      socketRef.current?.off('remote-note-moved');
      socketRef.current?.off('remote-note-updated');
      socketRef.current?.off('remote-note-created');
      socketRef.current?.off('remote-note-deleted');
    };
  }, [boardId, token, applyRemoteMove, applyRemoteUpdate, applyRemoteCreate, applyRemoteDelete]);

  /** Emit a note move to collaborators */
  const emitNoteMove = useCallback((noteId: string, position: { x: number; y: number }) => {
    socketRef.current?.emit('note-moved', { boardId: boardId || 'default', noteId, position });
  }, [boardId]);

  /** Emit a note content update to collaborators */
  const emitNoteUpdate = useCallback((noteId: string, updates: Record<string, any>) => {
    socketRef.current?.emit('note-updated', { boardId: boardId || 'default', noteId, updates });
  }, [boardId]);

  /** Emit a cursor position to collaborators */
  const emitCursorMove = useCallback((x: number, y: number, isLaser?: boolean) => {
    socketRef.current?.emit('cursor-move', { boardId: boardId || 'default', x, y, isLaser });
  }, [boardId]);

  return { emitNoteMove, emitNoteUpdate, emitCursorMove, socket: socketRef };
};
