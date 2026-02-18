'use client';

import { useRef, useEffect } from 'react';
import { FlipHorizontal, ChevronUp, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LayerContextMenuProps {
  x: number;
  y: number;
  onFlipHorizontal: () => void;
  onBringToFront: () => void;
  onDelete: () => void;
  onClose: () => void;
  className?: string;
}

export function LayerContextMenu({
  x,
  y,
  onFlipHorizontal,
  onBringToFront,
  onDelete,
  onClose,
  className,
}: LayerContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className={cn(
        'absolute z-50 flex items-center gap-0.5 p-1 rounded-lg bg-background-tertiary border border-border shadow-xl',
        className
      )}
      style={{ left: x, top: y }}
    >
      <button
        onClick={onFlipHorizontal}
        className="p-2 rounded-md hover:bg-surface text-text-secondary hover:text-text-primary transition-colors"
        title="Flip Horizontal"
      >
        <FlipHorizontal className="w-4 h-4" />
      </button>
      <button
        onClick={onBringToFront}
        className="p-2 rounded-md hover:bg-surface text-text-secondary hover:text-text-primary transition-colors"
        title="Bring to Front"
      >
        <ChevronUp className="w-4 h-4" />
      </button>
      <div className="w-px h-6 bg-border mx-0.5" />
      <button
        onClick={onDelete}
        className="p-2 rounded-md hover:bg-error/20 text-text-secondary hover:text-error transition-colors"
        title="Delete"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
