import { AspectRatio } from '@/types';

export const ASPECT_RATIOS: AspectRatio[] = [
  { name: 'Instagram Post', width: 1080, height: 1080, ratio: '1:1' },
  { name: 'Instagram Story', width: 1080, height: 1920, ratio: '9:16' },
  { name: 'LinkedIn Banner', width: 1584, height: 396, ratio: '4:1' },
  { name: 'Facebook Cover', width: 820, height: 312, ratio: '2.63:1' },
  { name: 'Twitter Header', width: 1500, height: 500, ratio: '3:1' },
  { name: 'YouTube Thumbnail', width: 1280, height: 720, ratio: '16:9' },
  { name: 'HD (16:9)', width: 1920, height: 1080, ratio: '16:9' },
  { name: 'Square (1:1)', width: 1000, height: 1000, ratio: '1:1' },
];

export const BLEND_MODES = [
  'normal',
  'multiply',
  'screen',
  'overlay',
  'darken',
  'lighten',
  'color-dodge',
  'color-burn',
  'hard-light',
  'soft-light',
  'difference',
  'exclusion',
];

export const AI_TOOLS = [
  {
    id: 'extract',
    name: 'Extract Objects',
    description: 'Extract objects using AI segmentation',
    icon: 'Scissors',
  },
  {
    id: 'expand',
    name: 'Generative Expand',
    description: 'AI-powered canvas outpainting',
    icon: 'Maximize2',
  },
  {
    id: 'font-match',
    name: 'AI Font Match',
    description: 'Match fonts from detected text',
    icon: 'Type',
  },
  {
    id: 'vector',
    name: 'Vector Convert',
    description: 'Convert raster to SVG',
    icon: 'Hexagon',
  },
  {
    id: 'refine',
    name: 'Smart Select Refine',
    description: 'Refine selection edges with AI',
    icon: 'Wand2',
  },
  {
    id: 'resize',
    name: 'Magic Resize',
    description: 'One-click resize to presets',
    icon: 'Crop',
  },
];

export const FILTER_PRESETS = {
  brightness: { min: -100, max: 100, default: 0 },
  contrast: { min: -100, max: 100, default: 0 },
  saturation: { min: -100, max: 100, default: 0 },
  blur: { min: 0, max: 20, default: 0 },
};

/** Base URL for the FastAPI backend. Set NEXT_PUBLIC_API_URL or defaults to localhost:8000. */
export const API_BASE_URL =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL) || 'http://localhost:8000';

export const CANVAS_DEFAULTS = {
  width: 1200,
  height: 800,
  backgroundColor: '#1A1A1F',
  minZoom: 0.1,
  maxZoom: 5,
  zoomStep: 0.1,
};
