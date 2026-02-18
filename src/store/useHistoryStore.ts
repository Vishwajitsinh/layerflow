import { create } from 'zustand';
import { Layer, CanvasState, HistoryEntry } from '@/types';
import { useLayerStore } from './useLayerStore';
import { useCanvasStore } from './useCanvasStore';

interface HistoryStore {
  past: HistoryEntry[];
  future: HistoryEntry[];
  maxHistory: number;
  addHistory: (action: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clearHistory: () => void;
}

const generateId = () => `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  past: [],
  future: [],
  maxHistory: 50,

  addHistory: (action) => {
    const layerStore = useLayerStore.getState();
    const canvasStore = useCanvasStore.getState();

    const entry: HistoryEntry = {
      id: generateId(),
      action,
      timestamp: Date.now(),
      state: {
        layers: JSON.parse(JSON.stringify(layerStore.layers)),
        canvas: {
          width: canvasStore.width,
          height: canvasStore.height,
          backgroundColor: canvasStore.backgroundColor,
          zoom: canvasStore.zoom,
          panX: canvasStore.panX,
          panY: canvasStore.panY,
          gridEnabled: canvasStore.gridEnabled,
          snapEnabled: canvasStore.snapEnabled,
        },
      },
    };

    set((state) => {
      const newPast = [...state.past, entry];
      if (newPast.length > state.maxHistory) {
        newPast.shift();
      }
      return {
        past: newPast,
        future: [],
      };
    });
  },

  undo: () => {
    const state = get();
    if (state.past.length === 0) return;

    const layerStore = useLayerStore.getState();
    const canvasStore = useCanvasStore.getState();

    const currentEntry: HistoryEntry = {
      id: generateId(),
      action: 'current',
      timestamp: Date.now(),
      state: {
        layers: JSON.parse(JSON.stringify(layerStore.layers)),
        canvas: {
          width: canvasStore.width,
          height: canvasStore.height,
          backgroundColor: canvasStore.backgroundColor,
          zoom: canvasStore.zoom,
          panX: canvasStore.panX,
          panY: canvasStore.panY,
          gridEnabled: canvasStore.gridEnabled,
          snapEnabled: canvasStore.snapEnabled,
        },
      },
    };

    const previousEntry = state.past[state.past.length - 1];

    useLayerStore.getState().addLayer = useLayerStore.getState().addLayer;
    useLayerStore.setState({ layers: previousEntry.state.layers });
    useCanvasStore.setState(previousEntry.state.canvas);

    set((state) => ({
      past: state.past.slice(0, -1),
      future: [currentEntry, ...state.future],
    }));
  },

  redo: () => {
    const state = get();
    if (state.future.length === 0) return;

    const layerStore = useLayerStore.getState();
    const canvasStore = useCanvasStore.getState();

    const currentEntry: HistoryEntry = {
      id: generateId(),
      action: 'current',
      timestamp: Date.now(),
      state: {
        layers: JSON.parse(JSON.stringify(layerStore.layers)),
        canvas: {
          width: canvasStore.width,
          height: canvasStore.height,
          backgroundColor: canvasStore.backgroundColor,
          zoom: canvasStore.zoom,
          panX: canvasStore.panX,
          panY: canvasStore.panY,
          gridEnabled: canvasStore.gridEnabled,
          snapEnabled: canvasStore.snapEnabled,
        },
      },
    };

    const nextEntry = state.future[0];

    useLayerStore.setState({ layers: nextEntry.state.layers });
    useCanvasStore.setState(nextEntry.state.canvas);

    set((state) => ({
      past: [...state.past, currentEntry],
      future: state.future.slice(1),
    }));
  },

  canUndo: () => get().past.length > 0,

  canRedo: () => get().future.length > 0,

  clearHistory: () => set({ past: [], future: [] }),
}));
