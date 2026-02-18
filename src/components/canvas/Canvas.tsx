'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { Stage, Layer as KonvaLayer, Rect, Transformer, Image as KonvaImage } from 'react-konva';
import Konva from 'konva';
import { useLayerStore } from '@/store/useLayerStore';
import { useCanvasStore } from '@/store/useCanvasStore';
import { useHistoryStore } from '@/store/useHistoryStore';
import { LayerContextMenu } from '@/components/ui/LayerContextMenu';
import { Layer } from '@/types';
import { cn } from '@/lib/utils';

interface CanvasProps {
  className?: string;
}

export function Canvas({ className }: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [images, setImages] = useState<Record<string, HTMLImageElement>>({});

  const { layers, selectedIds, setSelectedIds, updateLayer, removeLayer, bringToFront } = useLayerStore();
  const { width: canvasWidth, height: canvasHeight, backgroundColor, zoom, panX, panY, setZoom, setPan, gridEnabled } = useCanvasStore();
  const { addHistory } = useHistoryStore();

  // Load images
  useEffect(() => {
    const loadImages = async () => {
      const newImages: Record<string, HTMLImageElement> = {};
      for (const layer of layers) {
        if (layer.src && !images[layer.id]) {
          const img = new window.Image();
          img.src = layer.src;
          await new Promise((resolve) => {
            img.onload = resolve;
          });
          newImages[layer.id] = img;
        }
      }
      if (Object.keys(newImages).length > 0) {
        setImages((prev) => ({ ...prev, ...newImages }));
      }
    };
    loadImages();
  }, [layers]);

  // Handle resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedIds.length > 0 && !e.ctrlKey && !e.metaKey) {
          selectedIds.forEach((id) => useLayerStore.getState().removeLayer(id));
          setSelectedIds([]);
          addHistory('Delete layer');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds, setSelectedIds, addHistory]);

  // Update transformer
  useEffect(() => {
    if (transformerRef.current && stageRef.current) {
      const nodes = selectedIds
        .map((id) => stageRef.current?.findOne(`#${id}`))
        .filter(Boolean) as Konva.Node[];
      transformerRef.current.nodes(nodes);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selectedIds, layers]);

  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();
      const scaleBy = 1.05;
      const oldScale = zoom;
      const pointer = stageRef.current?.getPointerPosition();

      if (pointer) {
        const mousePointTo = {
          x: (pointer.x - panX) / oldScale,
          y: (pointer.y - panY) / oldScale,
        };

        const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
        setZoom(newScale);

        setPan(
          pointer.x - mousePointTo.x * newScale,
          pointer.y - mousePointTo.y * newScale
        );
      }
    },
    [zoom, panX, panY, setZoom, setPan]
  );

  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (e.target === e.target.getStage()) {
        setSelectedIds([]);
      }
    },
    [setSelectedIds]
  );

  const handleTransformEnd = useCallback(
    (e: Konva.KonvaEventObject<Event>, layerId: string) => {
      const node = e.target;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      const layer = layers.find((l) => l.id === layerId);

      node.scaleX(layer?.flipX ? -1 : 1);
      node.scaleY(layer?.flipY ? -1 : 1);

      updateLayer(layerId, {
        x: node.x() - (layer?.flipX ? Math.abs(node.width() * scaleX) : 0),
        y: node.y() - (layer?.flipY ? Math.abs(node.height() * scaleY) : 0),
        width: Math.max(5, Math.abs(node.width() * scaleX)),
        height: Math.max(5, Math.abs(node.height() * scaleY)),
        rotation: node.rotation(),
      });
      addHistory('Transform layer');
    },
    [layers, updateLayer, addHistory]
  );

  const handleDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>, layerId: string) => {
      const node = e.target;
      const layer = layers.find((l) => l.id === layerId);
      const x = layer?.flipX ? node.x() - layer.width : node.x();
      const y = layer?.flipY ? node.y() - layer.height : node.y();
      updateLayer(layerId, { x, y });
      addHistory('Move layer');
    },
    [layers, updateLayer, addHistory]
  );

  const handleSelect = useCallback(
    (layerId: string, e: Konva.KonvaEventObject<MouseEvent>) => {
      e.cancelBubble = true;
      if (e.evt.shiftKey) {
        if (selectedIds.includes(layerId)) {
          setSelectedIds(selectedIds.filter((id) => id !== layerId));
        } else {
          setSelectedIds([...selectedIds, layerId]);
        }
      } else {
        setSelectedIds([layerId]);
      }
    },
    [selectedIds, setSelectedIds]
  );

  const handleContextFlipHorizontal = useCallback(() => {
    selectedIds.forEach((id) => {
      const layer = layers.find((l) => l.id === id);
      if (layer) updateLayer(id, { flipX: !layer.flipX });
    });
    addHistory('Flip horizontal');
  }, [selectedIds, layers, updateLayer, addHistory]);

  const handleContextBringToFront = useCallback(() => {
    selectedIds.forEach((id) => bringToFront(id));
    addHistory('Bring to front');
  }, [selectedIds, bringToFront, addHistory]);

  const handleContextDelete = useCallback(() => {
    selectedIds.forEach((id) => removeLayer(id));
    setSelectedIds([]);
    addHistory('Delete layer');
  }, [selectedIds, removeLayer, setSelectedIds, addHistory]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex-1 bg-background-primary overflow-hidden relative',
        className
      )}
    >
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        scaleX={zoom}
        scaleY={zoom}
        x={panX}
        y={panY}
        onWheel={handleWheel}
        onClick={handleStageClick}
        draggable
        onDragEnd={(e) => {
          if (e.target === e.target.getStage()) {
            setPan(e.target.x(), e.target.y());
          }
        }}
      >
        {/* Canvas Background */}
        <KonvaLayer>
          <Rect
            x={0}
            y={0}
            width={canvasWidth}
            height={canvasHeight}
            fill={backgroundColor}
            listening={false}
          />
          {/* Grid */}
          {gridEnabled && (
            <>
              {Array.from({ length: Math.ceil(canvasWidth / 20) + 1 }).map((_, i) => (
                <Rect
                  key={`v-${i}`}
                  x={i * 20}
                  y={0}
                  width={1}
                  height={canvasHeight}
                  fill="#3A3A44"
                  opacity={0.3}
                  listening={false}
                />
              ))}
              {Array.from({ length: Math.ceil(canvasHeight / 20) + 1 }).map((_, i) => (
                <Rect
                  key={`h-${i}`}
                  x={0}
                  y={i * 20}
                  width={canvasWidth}
                  height={1}
                  fill="#3A3A44"
                  opacity={0.3}
                  listening={false}
                />
              ))}
            </>
          )}
        </KonvaLayer>

        {/* Layers */}
        <KonvaLayer>
          {layers.map((layer) => {
            if (!layer.visible) return null;
            const img = images[layer.id];

            return (
              <LayerComponent
                key={layer.id}
                layer={layer}
                image={img}
                isSelected={selectedIds.includes(layer.id)}
                onSelect={(e) => handleSelect(layer.id, e)}
                onTransformEnd={(e) => handleTransformEnd(e, layer.id)}
                onDragEnd={(e) => handleDragEnd(e, layer.id)}
              />
            );
          })}

          {/* Transformer */}
          <Transformer
            ref={transformerRef}
            boundBoxFunc={(oldBox, newBox) => {
              if (newBox.width < 5 || newBox.height < 5) {
                return oldBox;
              }
              return newBox;
            }}
            rotateEnabled={true}
            enabledAnchors={[
              'top-left',
              'top-right',
              'bottom-left',
              'bottom-right',
              'middle-left',
              'middle-right',
              'top-center',
              'bottom-center',
            ]}
            anchorFill="#ffffff"
            anchorStroke="#6366F1"
            anchorSize={8}
            borderStroke="#6366F1"
            borderStrokeWidth={2}
          />
        </KonvaLayer>
      </Stage>

      {/* Floating toolbar when layer selected */}
      {selectedIds.length > 0 && (
        <LayerContextMenu
          x={Math.max(16, dimensions.width / 2 - 100)}
          y={16}
          onFlipHorizontal={handleContextFlipHorizontal}
          onBringToFront={handleContextBringToFront}
          onDelete={handleContextDelete}
          onClose={() => {}}
        />
      )}

      {/* Empty State */}
      {layers.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-heading-2 text-text-secondary mb-2">Drop an image to start</p>
            <p className="text-body text-text-muted">
              Upload or drag an image from the left sidebar
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

interface LayerComponentProps {
  layer: Layer;
  image: HTMLImageElement | undefined;
  isSelected: boolean;
  onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onTransformEnd: (e: Konva.KonvaEventObject<Event>) => void;
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void;
}

function LayerComponent({
  layer,
  image,
  isSelected,
  onSelect,
  onTransformEnd,
  onDragEnd,
}: LayerComponentProps) {
  if (!image) {
    return (
      <Rect
        id={layer.id}
        x={layer.x}
        y={layer.y}
        width={layer.width}
        height={layer.height}
        fill="#26262E"
        stroke={isSelected ? '#6366F1' : undefined}
        strokeWidth={isSelected ? 2 : 0}
        draggable={!layer.locked}
        onClick={onSelect}
        onTap={onSelect}
        onTransformEnd={onTransformEnd}
        onDragEnd={onDragEnd}
      />
    );
  }

  return (
    <KonvaImage
      id={layer.id}
      image={image}
      x={layer.x + (layer.flipX ? layer.width : 0)}
      y={layer.y + (layer.flipY ? layer.height : 0)}
      width={layer.width}
      height={layer.height}
      scaleX={layer.flipX ? -1 : 1}
      scaleY={layer.flipY ? -1 : 1}
      rotation={layer.rotation}
      opacity={layer.opacity}
      visible={layer.visible}
      draggable={!layer.locked}
      onClick={onSelect}
      onTap={onSelect}
      onTransformEnd={onTransformEnd}
      onDragEnd={onDragEnd}
      perfectDrawEnabled={false}
      listening={!layer.locked}
    />
  );
}
