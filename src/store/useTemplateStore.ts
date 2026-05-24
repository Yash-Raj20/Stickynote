import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Template } from '@/lib/templates';
import api from '@/lib/api';

// Shape saved in DB
export interface SavedTemplate {
  _id: string;
  name: string;
  description: string;
  emoji: string;
  notes: Template['notes'];
  isFavorite: boolean;
  category: 'custom';
  createdAt: string;
}

// Convert SavedTemplate → Template (for gallery compatibility)
export function toTemplate(s: SavedTemplate): Template {
  return {
    id: s._id,
    name: s.name,
    description: s.description,
    emoji: s.emoji,
    category: 'custom',
    notes: s.notes,
  };
}

interface TemplateState {
  // Built-in template favorites (stored locally by template ID)
  builtinFavorites: string[];
  toggleBuiltinFavorite: (id: string) => void;

  // Recently used (built-in template IDs, local)
  recentlyUsed: string[];
  addRecentlyUsed: (id: string) => void;

  // Custom (saved) templates — synced with backend
  savedTemplates: SavedTemplate[];
  isLoading: boolean;
  fetchSavedTemplates: () => Promise<void>;
  saveCustomTemplate: (data: { name: string; description: string; emoji: string; notes: Template['notes'] }) => Promise<void>;
  deleteCustomTemplate: (id: string) => Promise<void>;
  toggleSavedFavorite: (id: string) => Promise<void>;
}

export const useTemplateStore = create<TemplateState>()(
  persist(
    (set, get) => ({
      builtinFavorites: [],
      recentlyUsed: [],
      savedTemplates: [],
      isLoading: false,

      toggleBuiltinFavorite: (id) => {
        const favs = get().builtinFavorites;
        set({
          builtinFavorites: favs.includes(id)
            ? favs.filter((f) => f !== id)
            : [...favs, id],
        });
      },

      addRecentlyUsed: (id) => {
        const recent = [id, ...get().recentlyUsed.filter((r) => r !== id)].slice(0, 4);
        set({ recentlyUsed: recent });
      },

      fetchSavedTemplates: async () => {
        try {
          set({ isLoading: true });
          const res = await api.get('/templates');
          set({ savedTemplates: res.data.data });
        } catch {
          // silently fail — user may not be logged in yet
        } finally {
          set({ isLoading: false });
        }
      },

      saveCustomTemplate: async (data) => {
        try {
          const res = await api.post('/templates', data);
          set({ savedTemplates: [res.data.data, ...get().savedTemplates] });
        } catch {
          throw new Error('Failed to save template');
        }
      },

      deleteCustomTemplate: async (id) => {
        try {
          await api.delete(`/templates/${id}`);
          set({ savedTemplates: get().savedTemplates.filter((t) => t._id !== id) });
        } catch {
          throw new Error('Failed to delete template');
        }
      },

      toggleSavedFavorite: async (id) => {
        try {
          const res = await api.patch(`/templates/${id}/favorite`);
          set({
            savedTemplates: get().savedTemplates.map((t) =>
              t._id === id ? { ...t, isFavorite: res.data.data.isFavorite } : t
            ),
          });
        } catch {
          throw new Error('Failed to toggle favorite');
        }
      },
    }),
    {
      name: 'sticky-templates-store',
      partialize: (state: TemplateState) => ({
        builtinFavorites: state.builtinFavorites,
        recentlyUsed:     state.recentlyUsed,
        // savedTemplates NOT persisted locally — always fetched from API
      }),
    } as any
  )
);
