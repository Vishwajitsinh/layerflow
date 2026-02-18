'use client';

import { useState } from 'react';
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Grid3X3,
  Magnet,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCanvasStore } from '@/store/useCanvasStore';
import { useHistoryStore } from '@/store/useHistoryStore';
import { formatZoom } from '@/lib/utils';
import { cn } from '@/lib/utils';

export function TopBar() {
  const [projectName, setProjectName] = useState('Untitled Project');
  const [isEditing, setIsEditing] = useState(false);
  const { zoom, setZoom, gridEnabled, toggleGrid, snapEnabled, toggleSnap, resetView } = useCanvasStore();
  const { undo, redo, canUndo, canRedo } = useHistoryStore();

  const handleZoomIn = () => setZoom(zoom + 0.1);
  const handleZoomOut = () => setZoom(zoom - 0.1);
  const handleResetView = () => resetView();

  const handleExport = () => {
    alert('Export functionality will be available when backend is connected.');
  };

  return (
    <header className="h-14 bg-background-secondary border-b border-border flex items-center justify-between px-4">
      {/* Left section */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <span className="text-heading-3 text-text-primary font-semibold">LayerForge</span>
        </div>
        <a
          href="/demo"
          className="text-body text-text-muted hover:text-primary transition-colors"
        >
          Demo
        </a>

        <div className="w-px h-6 bg-border" />

        {isEditing ? (
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            onBlur={() => setIsEditing(false)}
            onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
            className="h-8 px-2 bg-surface border border-border rounded text-body text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            autoFocus
          />
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="text-body text-text-secondary hover:text-text-primary transition-colors"
          >
            {projectName}
          </button>
        )}
      </div>

      {/* Center section - View controls */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={undo}
          disabled={!canUndo()}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={redo}
          disabled={!canRedo()}
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo2 className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-2" />

        <Button variant="ghost" size="sm" onClick={handleZoomOut} title="Zoom Out">
          <ZoomOut className="w-4 h-4" />
        </Button>
        <button
          onClick={handleResetView}
          className="h-7 px-2 text-body text-text-secondary hover:text-text-primary transition-colors min-w-[60px] text-center"
        >
          {formatZoom(zoom)}
        </button>
        <Button variant="ghost" size="sm" onClick={handleZoomIn} title="Zoom In">
          <ZoomIn className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-2" />

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleGrid}
          title="Toggle Grid"
          className={cn(gridEnabled && 'text-primary')}
        >
          <Grid3X3 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSnap}
          title="Toggle Snap"
          className={cn(snapEnabled && 'text-primary')}
        >
          <Magnet className="w-4 h-4" />
        </Button>
      </div>

      {/* Right section - Export */}
      <div className="flex items-center gap-2">
        <Button variant="primary" size="sm" onClick={handleExport}>
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>
    </header>
  );
}
