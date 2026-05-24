import { create } from 'zustand';
import api from '@/lib/api';

let fetchCounter = 0;

interface Position { x: number; y: number }
interface Size { width: number; height: number }

export interface Attachment { url: string; type: string; name: string; x?: number; y?: number; width?: number; height?: number; }
export interface Connection { targetId: string; }
export interface Comment { id: string; userId: string; userName: string; userAvatar?: string; text: string; createdAt: string; }

export interface Note {
  _id: string;
  title: string;
  content: string;       // TipTap HTML
  color: string;
  position: Position;
  size: Size;
  isFrame?: boolean;
  tags: string[];
  boardId?: string | null;
  shareToken?: string | null;
  isPublic?: boolean;
  isArchived?: boolean;
  isTrashed?: boolean;
  sharedWith?: { _id: string; name: string; email: string }[];
  userId?: { _id: string; name: string; email: string };
  connections?: Connection[];
  attachments?: Attachment[];
  comments?: Comment[];
  lastEditedBy?: string | null;
  reactions?: Record<string, string[]>;
  createdAt?: string;
  updatedAt?: string;
}

interface NotesState {
  notes: Note[];
  activeShareNoteId: string | null;
  setActiveShareNoteId: (id: string | null) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (isOpen: boolean) => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (isOpen: boolean) => void;
  isSettingsModalOpen: boolean;
  setIsSettingsModalOpen: (isOpen: boolean) => void;
  fetchNotes: (view?: 'active' | 'archived' | 'trashed' | 'shared', boardId?: string | null) => Promise<void>;
  addNote: (note: Partial<Note>) => Promise<void>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  setLocalNotePosition: (id: string, position: { x: number; y: number }) => void;
  setLocalNotePositions: (updates: { id: string; position: { x: number; y: number } }[]) => void;
  deleteNote: (id: string) => Promise<void>;
  addComment: (noteId: string, text: string) => Promise<void>;
  deleteComment: (noteId: string, commentId: string) => Promise<void>;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  activeShareNoteId: null,
  setActiveShareNoteId: (id) => set({ activeShareNoteId: id }),
  isSidebarOpen: false,
  setIsSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  isSearchOpen: false,
  setIsSearchOpen: (isOpen) => set({ isSearchOpen: isOpen }),
  isProfileModalOpen: false,
  setIsProfileModalOpen: (isOpen) => set({ isProfileModalOpen: isOpen }),
  isSettingsModalOpen: false,
  setIsSettingsModalOpen: (isOpen) => set({ isSettingsModalOpen: isOpen }),

  setLocalNotePosition: (id, position) => {
    set({ notes: get().notes.map(n => n._id === id ? { ...n, position } : n) });
  },
  setLocalNotePositions: (updates) => {
    const updateMap = new Map(updates.map(u => [u.id, u.position]));
    set({
      notes: get().notes.map(n => {
        if (updateMap.has(n._id)) return { ...n, position: updateMap.get(n._id)! };
        return n;
      })
    });
  },
  fetchNotes: async (view = 'active', boardId) => {
    const currentFetchId = ++fetchCounter;
    try {
      let endpoint = '/notes';
      if (view === 'archived') endpoint = '/notes/archived';
      if (view === 'trashed') endpoint = '/notes/trashed';
      if (view === 'shared') endpoint = '/notes/shared';
      
      // Append boardId param for default (active) view
      if (view === 'active' && boardId !== undefined) {
        endpoint = boardId ? `/notes?boardId=${boardId}` : '/notes';
      }
      
      const res = await api.get(endpoint);
      if (currentFetchId === fetchCounter) {
        set({ notes: res.data.data });
      }
    } catch (error) {
      console.error('Failed to fetch notes', error);
    }
  },
  addNote: async (note) => {
    try {
      const res = await api.post('/notes', note);
      set({ notes: [...get().notes, res.data.data] });
    } catch (error) {
      console.error('Failed to add note', error);
    }
  },
  updateNote: async (id, updates) => {
    // Optimistic update with view filtering based on URL
    set({ notes: get().notes.map(n => n._id === id ? { ...n, ...updates } : n).filter(n => {
      if (typeof window === 'undefined') return true;
      const pathname = window.location.pathname;
      const isArchivedView = pathname.includes('/archived');
      const isTrashedView = pathname.includes('/trashed');
      const isSharedView = pathname.includes('/shared');
      const isActiveView = !isArchivedView && !isTrashedView && !isSharedView;

      if (isActiveView && (n.isArchived || n.isTrashed)) return false;
      if (isArchivedView && (!n.isArchived || n.isTrashed)) return false;
      if (isTrashedView && !n.isTrashed) return false;
      return true;
    })});
    try {
      await api.patch(`/notes/${id}`, updates);
    } catch (error) {
      console.error('Failed to update note', error);
      throw error;
    }
  },
  deleteNote: async (id) => {
    set({ notes: get().notes.filter(n => n._id !== id) });
    try {
      await api.delete(`/notes/${id}`);
    } catch (error) {
      console.error('Failed to delete note', error);
    }
  },
  
  addComment: async (noteId, text) => {
    try {
      const res = await api.post(`/notes/${noteId}/comments`, { text });
      set({ notes: get().notes.map(n => n._id === noteId ? res.data.data : n) });
    } catch (error) {
      console.error('Failed to add comment', error);
      throw error;
    }
  },

  deleteComment: async (noteId, commentId) => {
    try {
      const res = await api.delete(`/notes/${noteId}/comments/${commentId}`);
      set({ notes: get().notes.map(n => n._id === noteId ? res.data.data : n) });
    } catch (error) {
      console.error('Failed to delete comment', error);
      throw error;
    }
  }
}));
