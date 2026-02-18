'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Upload,
  Maximize2,
  Type,
  Hexagon,
  Wand2,
  Crop,
  Loader2,
  Sparkles,
  Scissors,
  AlertCircle,
} from 'lucide-react';
import { useLayerStore } from '@/store/useLayerStore';
import { useHistoryStore } from '@/store/useHistoryStore';
import { decomposeImage } from '@/lib/api';
import { getImageDimensions } from '@/lib/utils';
import { generateId } from '@/lib/utils';
import { AI_TOOLS } from '@/lib/constants';
import { Layer } from '@/types';
import { cn } from '@/lib/utils';

const NUM_LAYERS = 5;

export function LeftSidebar() {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [decomposeError, setDecomposeError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const singleLayerInputRef = useRef<HTMLInputElement>(null);
  const decomposeInputRef = useRef<HTMLInputElement>(null);

  const { addLayer } = useLayerStore();
  const { addHistory } = useHistoryStore();

  const runDecomposition = useCallback(
    async (file: File) => {
      setIsProcessing(true);
      setDecomposeError(null);
      try {
        const { layers: urls } = await decomposeImage(file, NUM_LAYERS);
        if (urls.length === 0) {
          setDecomposeError('No layers returned from AI');
          return;
        }

        const baseName = file.name.replace(/\.[^/.]+$/, '');
        let offsetX = 100;
        let offsetY = 100;

        for (let i = 0; i < urls.length; i++) {
          const url = urls[i];
          const { width, height } = await getImageDimensions(url);
          const layer: Layer = {
            id: generateId('layer'),
            name: `${baseName} - Layer ${i + 1}`,
            type: 'image',
            visible: true,
            locked: false,
            opacity: 1,
            blendMode: 'normal',
            x: offsetX + i * 20,
            y: offsetY + i * 20,
            width,
            height,
            rotation: 0,
            src: url,
          };
          addLayer(layer);
        }
        addHistory(`AI Decompose: ${urls.length} layers`);
      } catch (err) {
        setDecomposeError(err instanceof Error ? err.message : 'Decomposition failed');
      } finally {
        setIsProcessing(false);
      }
    },
    [addLayer, addHistory]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      const imageFile = files.find((f) => f.type.startsWith('image/'));
      if (imageFile) {
        runDecomposition(imageFile);
      }
    },
    [runDecomposition]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files?.[0] && files[0].type.startsWith('image/')) {
        runDecomposition(files[0]);
      }
      e.target.value = '';
    },
    [runDecomposition]
  );

  const handleUploadZoneClick = () => {
    setDecomposeError(null);
    fileInputRef.current?.click();
  };

  const handleExtractClick = () => {
    setDecomposeError(null);
    decomposeInputRef.current?.click();
  };

  const handleDecomposeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      runDecomposition(file);
    }
    e.target.value = '';
  };

  const handleLoadSample = useCallback(async () => {
    setIsProcessing(true);
    setDecomposeError(null);
    try {
      const res = await fetch('/Underground_Tech_House_Vol_1_Cover.webp');
      if (!res.ok) throw new Error('Sample not found');
      const blob = await res.blob();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result as string);
        r.onerror = reject;
        r.readAsDataURL(blob);
      });
      const img = new window.Image();
      img.onload = () => {
        const layer: Layer = {
          id: generateId('layer'),
          name: 'Underground Tech House Cover',
          type: 'image',
          visible: true,
          locked: false,
          opacity: 1,
          blendMode: 'normal',
          x: 100,
          y: 100,
          width: img.width,
          height: img.height,
          rotation: 0,
          src: dataUrl,
        };
        addLayer(layer);
        addHistory('Add sample image');
      };
      img.src = dataUrl;
    } catch (err) {
      setDecomposeError(err instanceof Error ? err.message : 'Sample load failed');
    } finally {
      setIsProcessing(false);
    }
  }, [addLayer, addHistory]);

  const handleSingleLayerSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const src = ev.target?.result as string;
        const img = new window.Image();
        img.onload = () => {
          const layer: Layer = {
            id: generateId('layer'),
            name: file.name.replace(/\.[^/.]+$/, ''),
            type: 'image',
            visible: true,
            locked: false,
            opacity: 1,
            blendMode: 'normal',
            x: 100,
            y: 100,
            width: img.width,
            height: img.height,
            rotation: 0,
            src,
          };
          addLayer(layer);
          addHistory('Add image');
        };
        img.src = src;
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    },
    [addLayer, addHistory]
  );

  const handleAITool = async (toolId: string) => {
    if (toolId === 'extract') {
      handleExtractClick();
      return;
    }
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 1500));
    switch (toolId) {
      case 'expand':
        alert('Generative Expand: Drag canvas edges to expand and AI will fill in the background.');
        break;
      case 'font-match':
        alert('AI Font Match: This would analyze text in the image and suggest matching fonts.');
        break;
      case 'vector':
        alert('Vector Convert: This would convert selected raster layer to SVG.');
        break;
      case 'refine':
        alert('Smart Select Refine: Use the refine brush to fix selection edges.');
        break;
      case 'resize':
        alert('Magic Resize: Select an aspect ratio from the properties panel.');
        break;
    }
    setIsProcessing(false);
  };

  const iconMap: Record<string, React.ElementType> = {
    Scissors,
    Maximize2,
    Type,
    Hexagon,
    Wand2,
    Crop,
  };

  return (
    <aside className="w-[280px] h-full bg-background-secondary border-r border-border flex flex-col">
      {/* Upload Zone - Triggers Decomposition */}
      <div className="p-4 border-b border-border">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleUploadZoneClick}
          className={cn(
            'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-150',
            isDragging ? 'border-primary bg-primary/10' : 'border-border hover:border-text-muted hover:bg-surface/30',
            isProcessing && 'pointer-events-none opacity-80'
          )}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-8 h-8 mx-auto mb-2 text-primary animate-spin" />
              <p className="text-body text-text-secondary">Decomposing with AI...</p>
              <p className="text-caption text-text-muted">Creating {NUM_LAYERS} editable layers</p>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 mx-auto mb-2 text-text-muted" />
              <p className="text-body text-text-secondary">Drop image to decompose</p>
              <p className="text-caption text-text-muted">or click to browse</p>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        {decomposeError && (
          <div className="mt-2 flex items-center gap-2 p-2 rounded-md bg-error/10 border border-error/30 text-error text-caption">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{decomposeError}</span>
          </div>
        )}
      </div>

      {/* Add as single layer (no AI) */}
      <div className="p-2 border-b border-border space-y-1">
        <button
          onClick={() => singleLayerInputRef.current?.click()}
          disabled={isProcessing}
          className="w-full text-caption text-text-muted hover:text-text-secondary py-1 disabled:opacity-50 text-left"
        >
          + Add image (file picker)
        </button>
        <button
          onClick={handleLoadSample}
          disabled={isProcessing}
          className="w-full text-caption text-primary hover:text-primary/80 py-1 disabled:opacity-50 text-left"
        >
          + Load sample image
        </button>
        <input
          ref={singleLayerInputRef}
          type="file"
          accept="image/*"
          onChange={handleSingleLayerSelect}
          className="hidden"
        />
      </div>

        <input
          ref={decomposeInputRef}
          type="file"
          accept="image/*"
          onChange={handleDecomposeInputChange}
          className="hidden"
        />

      {/* AI Tools */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-secondary" />
          <h3 className="text-heading-3 text-text-primary">AI Tools</h3>
        </div>
        <div className="space-y-2">
          {AI_TOOLS.map((tool) => {
            const Icon = iconMap[tool.icon] || Sparkles;
            return (
              <button
                key={tool.id}
                onClick={() => handleAITool(tool.id)}
                disabled={isProcessing}
                className={cn(
                  'w-full p-3 rounded-md bg-surface border border-border hover:bg-background-tertiary',
                  'flex items-center gap-3 transition-all duration-150 text-left group',
                  isProcessing && 'opacity-50 cursor-not-allowed'
                )}
              >
                <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-body text-text-primary truncate">{tool.name}</p>
                  <p className="text-caption text-text-muted truncate">{tool.description}</p>
                </div>
                {isProcessing && <Loader2 className="w-4 h-4 text-secondary animate-spin flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
