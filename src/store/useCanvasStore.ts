import { create } from 'zustand';
import { CanvasState } from '@/types';

interface CanvasStore extends CanvasState {
  setCanvasSize: (width: number, height: number) => void;
  setBackgroundColor: (color: string) => void;
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  toggleGrid: () => void;
  toggleSnap: () => void;
  resetView: () => void;
}

const defaultCanvasState: CanvasState = {
  width: 1200,
  height: 800,
  backgroundColor: '#1A1A1F',
  zoom: 1,
  panX: 0,
  panY: 0,
  gridEnabled: false,
  snapEnabled: true,
};

export const useCanvasStore = create<CanvasStore>((set) => ({
  ...defaultCanvasState,

  setCanvasSize: (width, height) => set({ width, height }),

  setBackgroundColor: (color) => set({ backgroundColor: color }),

  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(5, zoom)) }),

  setPan: (panX, panY) => set({ panX, panY }),

  toggleGrid: () => set((state) => ({ gridEnabled: !state.gridEnabled })),

  toggleSnap: () => set((state) => ({ snapEnabled: !state.snapEnabled })),

  resetView: () =>
    set({
      zoom: 1,
      panX: 0,
      panY: 0,
    }),
}));
