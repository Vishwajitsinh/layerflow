import { create } from 'zustand';
import { Layer } from '@/types';

interface LayerStore {
  layers: Layer[];
  selectedIds: string[];
  addLayer: (layer: Layer) => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  removeLayer: (id: string) => void;
  reorderLayers: (fromIndex: number, toIndex: number) => void;
  setSelectedIds: (ids: string[]) => void;
  getSelectedLayers: () => Layer[];
  duplicateLayer: (id: string) => void;
  moveLayerUp: (id: string) => void;
  moveLayerDown: (id: string) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
}

const generateId = () => `layer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useLayerStore = create<LayerStore>((set, get) => ({
  layers: [],
  selectedIds: [],

  addLayer: (layer) =>
    set((state) => ({
      layers: [...state.layers, { ...layer, id: layer.id || generateId() }],
    })),

  updateLayer: (id, updates) =>
    set((state) => ({
      layers: state.layers.map((layer) =>
        layer.id === id ? { ...layer, ...updates } : layer
      ),
    })),

  removeLayer: (id) =>
    set((state) => ({
      layers: state.layers.filter((layer) => layer.id !== id),
      selectedIds: state.selectedIds.filter((selectedId) => selectedId !== id),
    })),

  reorderLayers: (fromIndex, toIndex) =>
    set((state) => {
      const newLayers = [...state.layers];
      const [removed] = newLayers.splice(fromIndex, 1);
      newLayers.splice(toIndex, 0, removed);
      return { layers: newLayers };
    }),

  setSelectedIds: (ids) => set({ selectedIds: ids }),

  getSelectedLayers: () => {
    const state = get();
    return state.layers.filter((layer) => state.selectedIds.includes(layer.id));
  },

  duplicateLayer: (id) => {
    const state = get();
    const layer = state.layers.find((l) => l.id === id);
    if (layer) {
      const newLayer: Layer = {
        ...layer,
        id: generateId(),
        name: `${layer.name} Copy`,
        x: layer.x + 20,
        y: layer.y + 20,
      };
      set((state) => ({
        layers: [...state.layers, newLayer],
      }));
    }
  },

  moveLayerUp: (id) =>
    set((state) => {
      const index = state.layers.findIndex((l) => l.id === id);
      if (index < state.layers.length - 1) {
        const newLayers = [...state.layers];
        [newLayers[index], newLayers[index + 1]] = [newLayers[index + 1], newLayers[index]];
        return { layers: newLayers };
      }
      return state;
    }),

  moveLayerDown: (id) =>
    set((state) => {
      const index = state.layers.findIndex((l) => l.id === id);
      if (index > 0) {
        const newLayers = [...state.layers];
        [newLayers[index], newLayers[index - 1]] = [newLayers[index - 1], newLayers[index]];
        return { layers: newLayers };
      }
      return state;
    }),

  bringToFront: (id) =>
    set((state) => {
      const index = state.layers.findIndex((l) => l.id === id);
      if (index >= 0 && index < state.layers.length - 1) {
        const newLayers = state.layers.filter((l) => l.id !== id);
        newLayers.push(state.layers[index]);
        return { layers: newLayers };
      }
      return state;
    }),

  sendToBack: (id) =>
    set((state) => {
      const index = state.layers.findIndex((l) => l.id === id);
      if (index > 0) {
        const newLayers = state.layers.filter((l) => l.id !== id);
        newLayers.unshift(state.layers[index]);
        return { layers: newLayers };
      }
      return state;
    }),
}));
