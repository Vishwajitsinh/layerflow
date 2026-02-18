'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, Loader2, Download, LayoutGrid, AlertCircle } from 'lucide-react';
import { decomposeImage } from '@/lib/api';
import { getImageDimensions, generateId } from '@/lib/utils';
import { useLayerStore } from '@/store/useLayerStore';
import { useHistoryStore } from '@/store/useHistoryStore';
import { Layer } from '@/types';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function DemoPage() {
  const [inputImage, setInputImage] = useState<string | null>(null);
  const [inputFile, setInputFile] = useState<File | null>(null);
  const [layers, setLayers] = useState<string[]>([]);
  const [numLayers, setNumLayers] = useState(5);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { addLayer } = useLayerStore();
  const { addHistory } = useHistoryStore();

  const runDecomposition = useCallback(async () => {
    if (!inputFile) return;
    setIsProcessing(true);
    setError(null);
    try {
      const { layers: urls } = await decomposeImage(inputFile, numLayers);
      if (urls.length === 0) {
        setError('No layers returned');
        return;
      }
      setLayers(urls);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Decomposition failed');
    } finally {
      setIsProcessing(false);
    }
  }, [inputFile, numLayers]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setInputFile(file);
    setLayers([]);
    setError(null);
    const reader = new FileReader();
    reader.onload = () => setInputImage(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  }, []);

  const loadSampleImage = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch('/Underground_Tech_House_Vol_1_Cover.webp');
      if (!res.ok) throw new Error('Sample image not found');
      const blob = await res.blob();
      const file = new File([blob], 'Underground_Tech_House_Vol_1_Cover.webp', {
        type: blob.type || 'image/webp',
      });
      setInputFile(file);
      setInputImage(URL.createObjectURL(blob));
      setLayers([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sample');
    }
  }, []);

  const addToCanvas = useCallback(async () => {
    if (layers.length === 0) return;
    const baseName = inputFile?.name.replace(/\.[^/.]+$/, '') ?? 'Layer';
    let offsetX = 80;
    let offsetY = 80;
    for (let i = 0; i < layers.length; i++) {
      const { width, height } = await getImageDimensions(layers[i]);
      const layer: Layer = {
        id: generateId('layer'),
        name: `${baseName} - Layer ${i + 1}`,
        type: 'image',
        visible: true,
        locked: false,
        opacity: 1,
        blendMode: 'normal',
        x: offsetX + i * 24,
        y: offsetY + i * 24,
        width,
        height,
        rotation: 0,
        src: layers[i],
      };
      addLayer(layer);
    }
    addHistory(`Add ${layers.length} layers to canvas`);
    window.location.href = '/';
  }, [layers, inputFile, addLayer, addHistory]);

  const exportZip = useCallback(async () => {
    if (layers.length === 0) return;
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      const imgFolder = zip.folder('layers');
      for (let i = 0; i < layers.length; i++) {
        const res = await fetch(layers[i]);
        const blob = await res.blob();
        imgFolder?.file(`layer_${i + 1}.png`, blob);
      }
      const content = await zip.generateAsync({ type: 'blob' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(content);
      a.download = `layers_${inputFile?.name.replace(/\.[^/.]+$/, '') ?? 'export'}.zip`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (e) {
      setError('Export failed. Try Add to canvas instead.');
    }
  }, [layers, inputFile]);

  return (
    <div className="min-h-screen bg-background-primary text-text-primary flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-heading-3 font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            LayerFlow
          </Link>
          <span className="text-text-muted">/</span>
          <span className="text-body text-text-secondary">Qwen-Image-Layered Demo</span>
        </div>
        <Link
          href="/"
          className="text-body text-text-secondary hover:text-text-primary transition-colors"
        >
          ← Canvas Editor
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Upload & params */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'flex-1 min-h-[140px] border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all flex flex-col items-center justify-center gap-2',
                inputImage
                  ? 'border-primary/50 bg-primary/5'
                  : 'border-border hover:border-primary/50 hover:bg-surface/50'
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              {inputImage ? (
                <img
                  src={inputImage}
                  alt="Input"
                  className="max-h-32 rounded-lg object-contain"
                />
              ) : (
                <>
                  <Upload className="w-10 h-10 text-text-muted" />
                  <p className="text-body text-text-secondary">Drop image or click to upload</p>
                  <p className="text-caption text-text-muted">PNG, JPEG, WebP, GIF</p>
                </>
              )}
            </div>
            <div className="flex flex-col gap-3 w-full sm:w-48">
              <div>
                <label className="text-caption text-text-muted block mb-1">Number of layers</label>
                <input
                  type="range"
                  min={3}
                  max={8}
                  value={numLayers}
                  onChange={(e) => setNumLayers(Number(e.target.value))}
                  className="w-full"
                />
                <span className="text-body text-text-primary ml-2">{numLayers}</span>
              </div>
              <button
                onClick={loadSampleImage}
                disabled={isProcessing}
                className="h-11 px-6 rounded-lg bg-surface border border-border hover:bg-background-tertiary flex items-center justify-center gap-2 text-body"
              >
                Load sample image
              </button>
              <button
                onClick={runDecomposition}
                disabled={!inputFile || isProcessing}
                className={cn(
                  'h-11 px-6 rounded-lg font-medium flex items-center justify-center gap-2 transition-all',
                  'bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Decomposing...
                  </>
                ) : (
                  'Decompose'
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-error/10 border border-error/30 text-error text-body">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Results grid */}
          {layers.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-heading-3 text-text-primary">Decomposed layers</h3>
              <div
                className="grid gap-3"
                style={{
                  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                }}
              >
                {layers.map((url, i) => (
                  <div
                    key={i}
                    className="rounded-lg overflow-hidden bg-surface border border-border aspect-square flex items-center justify-center p-2"
                  >
                    <img
                      src={url}
                      alt={`Layer ${i + 1}`}
                      className="max-w-full max-h-full object-contain"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={exportZip}
                  className="h-10 px-4 rounded-lg bg-surface border border-border hover:bg-background-tertiary flex items-center gap-2 text-body"
                >
                  <Download className="w-4 h-4" />
                  Export ZIP
                </button>
                <button
                  onClick={addToCanvas}
                  className="h-10 px-4 rounded-lg bg-primary text-white hover:bg-primary/90 flex items-center gap-2 text-body"
                >
                  <LayoutGrid className="w-4 h-4" />
                  Add to canvas editor
                </button>
              </div>
            </div>
          )}

          {!inputImage && (
            <div className="text-center py-12 text-text-muted">
              <p className="text-body">Upload an image to decompose it into editable RGBA layers.</p>
              <p className="text-caption mt-1">
                Powered by{' '}
                <a
                  href="https://fal.ai/models/fal-ai/qwen-image-layered"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  fal.ai/qwen-image-layered
                </a>
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
