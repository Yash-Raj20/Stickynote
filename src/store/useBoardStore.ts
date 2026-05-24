import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';

export interface Board {
  _id: string;
  name: string;
  emoji: string;
  userId: string;
  createdAt: string;
}

interface BoardState {
  boards: Board[];
  activeBoardId: string | null;  // null = default (no board)
  setActiveBoardId: (id: string | null) => void;
  fetchBoards: () => Promise<void>;
  createBoard: (name: string, emoji: string) => Promise<Board>;
  updateBoard: (id: string, data: { name?: string; emoji?: string }) => Promise<void>;
  deleteBoard: (id: string) => Promise<void>;
}

export const useBoardStore = create<BoardState>()(
  persist(
    (set, get) => ({
      boards: [],
      activeBoardId: null,

  setActiveBoardId: (id) => set({ activeBoardId: id }),

  fetchBoards: async () => {
    try {
      const res = await api.get('/boards');
      set({ boards: res.data.data });
    } catch (error) {
      console.error('Failed to fetch boards', error);
    }
  },

  createBoard: async (name, emoji) => {
    const res = await api.post('/boards', { name, emoji });
    const board: Board = res.data.data;
    set({ boards: [...get().boards, board] });
    return board;
  },

  updateBoard: async (id, data) => {
    const res = await api.patch(`/boards/${id}`, data);
    set({
      boards: get().boards.map((b) => (b._id === id ? res.data.data : b)),
    });
  },

  deleteBoard: async (id) => {
    await api.delete(`/boards/${id}`);
    const next = get().boards.filter((b) => b._id !== id);
    set({ boards: next, activeBoardId: get().activeBoardId === id ? null : get().activeBoardId });
  },
}),
    {
      name: 'board-storage', // name of the item in the storage (must be unique)
      partialize: (state) => ({ activeBoardId: state.activeBoardId }), // only save activeBoardId
    }
  )
);
