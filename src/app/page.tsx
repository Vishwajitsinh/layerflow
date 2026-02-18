'use client';

import dynamic from 'next/dynamic';
import { TopBar } from '@/components/panels/TopBar';
import { LeftSidebar } from '@/components/panels/LeftSidebar';
import { RightSidebar } from '@/components/panels/RightSidebar';

// Dynamically import Canvas to avoid SSR issues with Konva
const Canvas = dynamic(() => import('@/components/canvas/Canvas').then(mod => ({ default: mod.Canvas })), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-background-primary">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-body text-text-secondary">Loading canvas...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  return (
    <main className="h-screen w-screen flex flex-col overflow-hidden bg-background-primary">
      {/* Top Bar */}
      <TopBar />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Assets & AI Tools */}
        <LeftSidebar />

        {/* Canvas Area */}
        <Canvas />

        {/* Right Sidebar - Layers & Properties */}
        <RightSidebar />
      </div>
    </main>
  );
}
