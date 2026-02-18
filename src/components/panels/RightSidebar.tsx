'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Layers,
  Sliders,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  LayoutGrid,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Slider } from '@/components/ui/Slider';
import { Dropdown } from '@/components/ui/Dropdown';
import { useLayerStore } from '@/store/useLayerStore';
import { useCanvasStore } from '@/store/useCanvasStore';
import { useHistoryStore } from '@/store/useHistoryStore';
import { BLEND_MODES, ASPECT_RATIOS, FILTER_PRESETS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Layer } from '@/types';

export function RightSidebar() {
  const [activeTab, setActiveTab] = useState<'layers' | 'properties'>('layers');
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const { layers, selectedIds, setSelectedIds, updateLayer, removeLayer, moveLayerUp, moveLayerDown, duplicateLayer } = useLayerStore();
  const { width: canvasWidth, height: canvasHeight, setCanvasSize } = useCanvasStore();
  const { addHistory } = useHistoryStore();

  const selectedLayer = layers.find((l) => selectedIds.includes(l.id));

  const handleLayerClick = (layerId: string, e: React.MouseEvent) => {
    if (e.shiftKey) {
      if (selectedIds.includes(layerId)) {
        setSelectedIds(selectedIds.filter((id) => id !== layerId));
      } else {
        setSelectedIds([...selectedIds, layerId]);
      }
    } else {
      setSelectedIds([layerId]);
    }
  };

  const handleNameEdit = (layer: Layer) => {
    setEditingLayerId(layer.id);
    setEditingName(layer.name);
  };

  const handleNameSave = () => {
    if (editingLayerId && editingName.trim()) {
      updateLayer(editingLayerId, { name: editingName.trim() });
      addHistory('Rename layer');
    }
    setEditingLayerId(null);
    setEditingName('');
  };

  const handleDelete = () => {
    if (selectedIds.length > 0) {
      selectedIds.forEach((id) => removeLayer(id));
      setSelectedIds([]);
      addHistory('Delete layer');
    }
  };

  const handleDuplicate = () => {
    if (selectedIds.length > 0) {
      selectedIds.forEach((id) => duplicateLayer(id));
      addHistory('Duplicate layer');
    }
  };

  return (
    <aside className="w-[300px] h-full bg-background-secondary border-l border-border flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('layers')}
          className={cn(
            'flex-1 h-11 flex items-center justify-center gap-2 text-body transition-colors',
            activeTab === 'layers'
              ? 'text-text-primary border-b-2 border-primary'
              : 'text-text-secondary hover:text-text-primary'
          )}
        >
          <Layers className="w-4 h-4" />
          Layers
        </button>
        <button
          onClick={() => setActiveTab('properties')}
          className={cn(
            'flex-1 h-11 flex items-center justify-center gap-2 text-body transition-colors',
            activeTab === 'properties'
              ? 'text-text-primary border-b-2 border-primary'
              : 'text-text-secondary hover:text-text-primary'
          )}
        >
          <Sliders className="w-4 h-4" />
          Properties
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'layers' ? (
          <LayerStack
            layers={layers}
            selectedIds={selectedIds}
            editingLayerId={editingLayerId}
            editingName={editingName}
            onLayerClick={handleLayerClick}
            onToggleVisibility={(id) => {
              const layer = layers.find((l) => l.id === id);
              if (layer) {
                updateLayer(id, { visible: !layer.visible });
                addHistory('Toggle visibility');
              }
            }}
            onToggleLock={(id) => {
              const layer = layers.find((l) => l.id === id);
              if (layer) {
                updateLayer(id, { locked: !layer.locked });
                addHistory('Toggle lock');
              }
            }}
            onNameEdit={handleNameEdit}
            onNameChange={setEditingName}
            onNameSave={handleNameSave}
            onMoveUp={moveLayerUp}
            onMoveDown={moveLayerDown}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
          />
        ) : (
          <PropertiesPanel
            selectedLayer={selectedLayer}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            onUpdateLayer={(updates) => {
              if (selectedLayer) {
                updateLayer(selectedLayer.id, updates);
                addHistory('Update layer');
              }
            }}
            onCanvasResize={setCanvasSize}
          />
        )}
      </div>
    </aside>
  );
}

interface LayerStackProps {
  layers: Layer[];
  selectedIds: string[];
  editingLayerId: string | null;
  editingName: string;
  onLayerClick: (id: string, e: React.MouseEvent) => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onNameEdit: (layer: Layer) => void;
  onNameChange: (name: string) => void;
  onNameSave: () => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

function LayerStack({
  layers,
  selectedIds,
  editingLayerId,
  editingName,
  onLayerClick,
  onToggleVisibility,
  onToggleLock,
  onNameEdit,
  onNameChange,
  onNameSave,
  onMoveUp,
  onMoveDown,
  onDelete,
  onDuplicate,
}: LayerStackProps) {
  const reversedLayers = [...layers].reverse();

  if (layers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <Layers className="w-12 h-12 text-text-muted mb-3" />
        <p className="text-body text-text-secondary">No layers yet</p>
        <p className="text-caption text-text-muted">Upload an image to get started</p>
      </div>
    );
  }

  return (
    <div className="p-2">
      {/* Actions */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-1 p-2 mb-2 bg-surface rounded-md">
          <Button variant="ghost" size="sm" onClick={onDuplicate} title="Duplicate">
            <Copy className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete} title="Delete">
            <Trash2 className="w-4 h-4" />
          </Button>
          <div className="flex-1" />
          <Button variant="ghost" size="sm" onClick={() => onMoveUp(selectedIds[0])} title="Bring Forward">
            <ChevronUp className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onMoveDown(selectedIds[0])} title="Send Backward">
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Layer List */}
      <div className="space-y-1">
        {reversedLayers.map((layer, index) => {
          const actualIndex = layers.length - 1 - index;
          const isSelected = selectedIds.includes(layer.id);
          const isEditing = editingLayerId === layer.id;

          return (
            <div
              key={layer.id}
              onClick={(e) => onLayerClick(layer.id, e)}
              className={cn(
                'flex items-center gap-2 p-2 rounded-md cursor-pointer transition-all',
                isSelected
                  ? 'bg-primary/20 border border-primary/50'
                  : 'hover:bg-surface border border-transparent'
              )}
            >
              {/* Thumbnail */}
              <div className="w-10 h-10 rounded bg-surface flex-shrink-0 overflow-hidden">
                {layer.src && (
                  <img src={layer.src} alt={layer.name} className="w-full h-full object-cover" />
                )}
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => onNameChange(e.target.value)}
                    onBlur={onNameSave}
                    onKeyDown={(e) => e.key === 'Enter' && onNameSave()}
                    className="w-full h-6 px-1 bg-surface border border-border rounded text-body text-text-primary focus:outline-none"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <p
                    onDoubleClick={() => onNameEdit(layer)}
                    className="text-body text-text-primary truncate"
                  >
                    {layer.name}
                  </p>
                )}
                <p className="text-caption text-text-muted capitalize">{layer.type}</p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-0.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleVisibility(layer.id);
                  }}
                  className={cn(
                    'p-1.5 rounded hover:bg-surface transition-colors',
                    layer.visible ? 'text-text-secondary' : 'text-text-muted'
                  )}
                >
                  {layer.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleLock(layer.id);
                  }}
                  className={cn(
                    'p-1.5 rounded hover:bg-surface transition-colors',
                    layer.locked ? 'text-warning' : 'text-text-muted'
                  )}
                >
                  {layer.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface PropertiesPanelProps {
  selectedLayer: Layer | undefined;
  canvasWidth: number;
  canvasHeight: number;
  onUpdateLayer: (updates: Partial<Layer>) => void;
  onCanvasResize: (width: number, height: number) => void;
}

function PropertiesPanel({
  selectedLayer,
  canvasWidth,
  canvasHeight,
  onUpdateLayer,
  onCanvasResize,
}: PropertiesPanelProps) {
  if (!selectedLayer) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <Sliders className="w-12 h-12 text-text-muted mb-3" />
        <p className="text-body text-text-secondary">No layer selected</p>
        <p className="text-caption text-text-muted">Select a layer to edit properties</p>

        {/* Canvas Settings */}
        <div className="mt-6 w-full">
          <h4 className="text-heading-3 text-text-primary mb-3">Canvas Size</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-surface rounded-md">
              <p className="text-caption text-text-muted mb-1">Width</p>
              <p className="text-body text-text-primary">{canvasWidth}px</p>
            </div>
            <div className="p-3 bg-surface rounded-md">
              <p className="text-caption text-text-muted mb-1">Height</p>
              <p className="text-body text-text-primary">{canvasHeight}px</p>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            <p className="text-caption text-text-muted">Quick Presets</p>
            <div className="grid grid-cols-2 gap-2">
              {ASPECT_RATIOS.slice(0, 4).map((ratio) => (
                <button
                  key={ratio.name}
                  onClick={() => onCanvasResize(ratio.width, ratio.height)}
                  className="p-left bg-2 text-surface rounded-md hover:bg-background-tertiary transition-colors"
                >
                  <p className="text-caption text-text-primary truncate">{ratio.name}</p>
                  <p className="text-caption text-text-muted">{ratio.width}x{ratio.height}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Transform */}
      <div>
        <h4 className="text-heading-3 text-text-primary mb-3">Transform</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-caption text-text-muted">X</label>
            <input
              type="number"
              value={Math.round(selectedLayer.x)}
              onChange={(e) => onUpdateLayer({ x: Number(e.target.value) })}
              className="w-full h-8 px-2 bg-surface border border-border rounded text-body text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-caption text-text-muted">Y</label>
            <input
              type="number"
              value={Math.round(selectedLayer.y)}
              onChange={(e) => onUpdateLayer({ y: Number(e.target.value) })}
              className="w-full h-8 px-2 bg-surface border border-border rounded text-body text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-caption text-text-muted">Width</label>
            <input
              type="number"
              value={Math.round(selectedLayer.width)}
              onChange={(e) => onUpdateLayer({ width: Number(e.target.value) })}
              className="w-full h-8 px-2 bg-surface border border-border rounded text-body text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-caption text-text-muted">Height</label>
            <input
              type="number"
              value={Math.round(selectedLayer.height)}
              onChange={(e) => onUpdateLayer({ height: Number(e.target.value) })}
              className="w-full h-8 px-2 bg-surface border border-border rounded text-body text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
        <div className="mt-3">
          <label className="text-caption text-text-muted">Rotation</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={-180}
              max={180}
              value={selectedLayer.rotation}
              onChange={(e) => onUpdateLayer({ rotation: Number(e.target.value) })}
              className="flex-1"
            />
            <span className="text-caption text-text-secondary w-10">{selectedLayer.rotation}°</span>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div>
        <h4 className="text-heading-3 text-text-primary mb-3">Appearance</h4>
        <Slider
          label="Opacity"
          value={Math.round(selectedLayer.opacity * 100)}
          onChange={(value) => onUpdateLayer({ opacity: value / 100 })}
          min={0}
          max={100}
        />
        <div className="mt-3">
          <Dropdown
            label="Blend Mode"
            options={BLEND_MODES.map((mode) => ({ value: mode, label: mode }))}
            value={selectedLayer.blendMode}
            onChange={(value) => onUpdateLayer({ blendMode: value })}
          />
        </div>
      </div>

      {/* Filters */}
      <div>
        <h4 className="text-heading-3 text-text-primary mb-3">Filters</h4>
        <div className="space-y-3">
          <Slider
            label="Brightness"
            value={(selectedLayer.filters?.find((f) => f.name === 'brightness')?.value ?? 0)}
            onChange={(value) => {
              const filters = selectedLayer.filters || [];
              const existing = filters.findIndex((f) => f.name === 'brightness');
              if (existing >= 0) {
                filters[existing].value = value;
              } else {
                filters.push({ name: 'brightness', value });
              }
              onUpdateLayer({ filters: [...filters] });
            }}
            min={FILTER_PRESETS.brightness.min}
            max={FILTER_PRESETS.brightness.max}
          />
          <Slider
            label="Contrast"
            value={(selectedLayer.filters?.find((f) => f.name === 'contrast')?.value ?? 0)}
            onChange={(value) => {
              const filters = selectedLayer.filters || [];
              const existing = filters.findIndex((f) => f.name === 'contrast');
              if (existing >= 0) {
                filters[existing].value = value;
              } else {
                filters.push({ name: 'contrast', value });
              }
              onUpdateLayer({ filters: [...filters] });
            }}
            min={FILTER_PRESETS.contrast.min}
            max={FILTER_PRESETS.contrast.max}
          />
          <Slider
            label="Blur"
            value={(selectedLayer.filters?.find((f) => f.name === 'blur')?.value ?? 0)}
            onChange={(value) => {
              const filters = selectedLayer.filters || [];
              const existing = filters.findIndex((f) => f.name === 'blur');
              if (existing >= 0) {
                filters[existing].value = value;
              } else {
                filters.push({ name: 'blur', value });
              }
              onUpdateLayer({ filters: [...filters] });
            }}
            min={FILTER_PRESETS.blur.min}
            max={FILTER_PRESETS.blur.max}
          />
        </div>
      </div>

      {/* Alignment */}
      <div>
        <h4 className="text-heading-3 text-text-primary mb-3">Align</h4>
        <div className="grid grid-cols-3 gap-1">
          <Button variant="secondary" size="sm" title="Align Left">
            <AlignLeft className="w-4 h-4" />
          </Button>
          <Button variant="secondary" size="sm" title="Align Center Horizontal">
            <AlignCenter className="w-4 h-4" />
          </Button>
          <Button variant="secondary" size="sm" title="Align Right">
            <AlignRight className="w-4 h-4" />
          </Button>
          <Button variant="secondary" size="sm" title="Align Top">
            <AlignStartVertical className="w-4 h-4" />
          </Button>
          <Button variant="secondary" size="sm" title="Align Middle">
            <AlignCenterVertical className="w-4 h-4" />
          </Button>
          <Button variant="secondary" size="sm" title="Align Bottom">
            <AlignEndVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
