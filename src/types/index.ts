export interface Layer {
  id: string;
  name: string;
  type: 'image' | 'text' | 'shape' | 'group';
  visible: boolean;
  locked: boolean;
  opacity: number;
  blendMode: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  flipX?: boolean;
  flipY?: boolean;
  src?: string;
  data?: any;
  filters?: LayerFilter[];
  children?: Layer[];
}

export interface LayerFilter {
  name: string;
  value: number;
}

export interface CanvasState {
  width: number;
  height: number;
  backgroundColor: string;
  zoom: number;
  panX: number;
  panY: number;
  gridEnabled: boolean;
  snapEnabled: boolean;
}

export interface SelectionState {
  selectedIds: string[];
  transformMode: 'none' | 'select' | 'rotate' | 'resize';
}

export interface HistoryEntry {
  id: string;
  action: string;
  timestamp: number;
  state: {
    layers: Layer[];
    canvas: CanvasState;
  };
}

export interface AIProcessingState {
  isProcessing: boolean;
  progress: number;
  currentTask: string;
  error: string | null;
}

export type AspectRatio = {
  name: string;
  width: number;
  height: number;
  ratio: string;
};
