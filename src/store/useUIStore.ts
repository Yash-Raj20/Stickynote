import { create } from 'zustand';

export interface GuideLine {
  axis: 'x' | 'y';
  pos: number;
}

interface UIState {
  guides: GuideLine[];
  toolMode: 'move' | 'hand' | 'laser' | 'arrow';
  setGuides: (guides: GuideLine[]) => void;
  clearGuides: () => void;
  setToolMode: (mode: 'move' | 'hand' | 'laser' | 'arrow') => void;
}

export const useUIStore = create<UIState>((set) => ({
  guides: [],
  toolMode: 'move',
  setGuides: (guides) => set({ guides }),
  clearGuides: () => set({ guides: [] }),
  setToolMode: (mode) => set({ toolMode: mode }),
}));
