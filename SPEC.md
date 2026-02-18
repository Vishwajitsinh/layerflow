# LayerForge AI - Specification Document

## 1. Project Overview

**Project Name:** LayerForge AI
**Type:** Web-based AI-native design platform
**Core Functionality:** Deconstruct flat images into editable, multi-layered canvases with AI-powered extraction, editing, and enhancement tools.
**Target Users:** Designers, marketers, content creators, and developers who need to extract, edit, and manipulate image layers with AI assistance.

---

## 2. UI/UX Specification

### 2.1 Layout Structure

**Overall Layout:**
- Full viewport application (100vw × 100vh)
- Dark-themed professional interface
- Three-column layout: Left sidebar (assets) | Main canvas (center) | Right sidebar (layers)

**Page Sections:**
- **Top Bar** (height: 56px): Logo, project name, view controls, export button
- **Left Sidebar** (width: 280px): Asset panel with uploaded images, extracted layers, AI tools
- **Main Canvas Area** (flexible): Konva.js canvas with zoom/pan controls
- **Right Sidebar** (width: 300px): Layer stack, properties panel, context-aware tools

**Responsive Breakpoints:**
- Desktop: ≥1280px (full three-column layout)
- Tablet: 768px-1279px (collapsible sidebars)
- Mobile: <768px (single column with bottom navigation)

### 2.2 Visual Design

**Color Palette:**
- Background Primary: `#0D0D0F` (near black)
- Background Secondary: `#16161A` (dark charcoal)
- Background Tertiary: `#1E1E24` (panel backgrounds)
- Surface: `#26262E` (cards, inputs)
- Border: `#3A3A44` (subtle borders)
- Primary Accent: `#6366F1` (indigo - actions, highlights)
- Secondary Accent: `#22D3EE` (cyan - AI features)
- Success: `#10B981` (emerald)
- Warning: `#F59E0B` (amber)
- Error: `#EF4444` (red)
- Text Primary: `#F4F4F5` (zinc-100)
- Text Secondary: `#A1A1AA` (zinc-400)
- Text Muted: `#71717A` (zinc-500)

**Typography:**
- Font Family: `"Geist Sans", "SF Pro Display", system-ui, sans-serif`
- Monospace: `"Geist Mono", "SF Mono", monospace`
- Heading 1: 24px / 700 weight
- Heading 2: 18px / 600 weight
- Heading 3: 14px / 600 weight
- Body: 13px / 400 weight
- Caption: 11px / 400 weight

**Spacing System:**
- Base unit: 4px
- xs: 4px, sm: 8px, md: 12px, lg: 16px, xl: 24px, 2xl: 32px

**Visual Effects:**
- Panel shadows: `0 4px 24px rgba(0,0,0,0.4)`
- Button hover: brightness increase + subtle scale(1.02)
- Transitions: 150ms ease-out for interactions
- Canvas drop shadows: `0 8px 32px rgba(0,0,0,0.5)`
- Glassmorphism on modals: `backdrop-filter: blur(12px)`

### 2.3 Components

**Top Bar:**
- Logo (LayerForge icon + text)
- Project title (editable on click)
- Zoom controls (-, percentage, +)
- View mode toggle (fit, 1:1, custom)
- Undo/Redo buttons with keyboard shortcuts displayed
- Export dropdown (PNG, JPG, SVG, Project)

**Left Sidebar - Asset Panel:**
- Upload zone (drag & drop + click)
- Uploaded images grid (thumbnails)
- Extracted layers section
- AI Tools section:
  - "Extract Objects" button
  - "Generative Expand" button
  - "AI Font Match" button
  - "Vector Convert" button
  - "Smart Select Refine" button

**Main Canvas:**
- Konva.js stage with dark background (#1A1A1F)
- Rulers (top, left) - optional
- Grid overlay (toggleable)
- Selection handles (resizable, rotatable)
- Context toolbar on selection

**Right Sidebar - Layer Stack:**
- Layer list with thumbnails
- Visibility toggle (eye icon)
- Lock toggle
- Layer name (editable)
- Opacity slider
- Blend mode dropdown
- Drag to reorder
- "Add Layer" button

**Properties Panel:**
- Transform: X, Y, Width, Height, Rotation
- Appearance: Opacity, Blend Mode
- Filters: Brightness, Contrast, Saturation, Blur
- Position: Align buttons (left, center, right, top, middle, bottom)
- Distribution: Distribute horizontally/vertically

**Context Toolbar (appears on selection):**
- Crop, cut, copy, paste, delete
- Flip horizontal/vertical
- Group/Ungroup
- Bring forward/Send backward
- AI actions based on selection type

**Loading States:**
- Skeleton loaders for panels
- Pulsing animation on processing
- Progress bar for AI operations
- Low-res preview during processing

---

## 3. Functionality Specification

### 3.1 Core Features

**Image Upload:**
- Drag & drop anywhere on canvas
- File picker in left sidebar
- Supported formats: PNG, JPG, WEBP, SVG
- Max file size: 50MB
- Automatic preview generation

**Object Extraction (SAM 2):**
- Click to select object
- Brush to add/remove from selection
- Auto-detect all objects option
- Extraction preview before applying
- Background hole-filling automatically

**Generative Expand (Outpainting):**
- Canvas resize handles
- AI fills missing background
- Directional controls (expand from center, left, right, top, bottom)
- Quality settings (draft, standard, high)

**AI Font Matching:**
- OCR text extraction
- Font suggestions panel
- Preview with suggested fonts
- One-click apply to editable text layer

**Vector Conversion:**
- Select raster layer
- Convert to SVG option
- SVG preview modal
- Download or add to canvas

**Smart Selection Refine:**
- Edge detection mask
- Brush to refine edges
- Feather radius control
- Decontaminate colors option

**One-Click Magic Resize:**
- Preset aspect ratios:
  - Instagram Post (1:1)
  - Instagram Story (9:16)
  - LinkedIn Banner (4:1)
  - Facebook Cover (2.63:1)
  - Twitter Header (3:1)
  - Custom
- Auto-reposition salient objects
- Background fill

### 3.2 Canvas Engine Features

**Non-destructive Editing:**
- Filters as adjustment layers
- Original image preserved
- Revert to original anytime

**Grouping & Alignment:**
- Multi-select (Shift+click)
- Group layers (Ctrl+G)
- Ungroup (Ctrl+Shift+G)
- Align: Left, Center, Right, Top, Middle, Bottom
- Distribute: Horizontally, Vertically
- Snap to grid (toggleable)
- Snap to guides (toggleable)

**History Tree:**
- Infinite undo/redo
- History panel showing actions
- Click to jump to state
- Branch history (alternative timelines)

### 3.3 User Interactions

**Canvas Interactions:**
- Pan: Space + drag OR middle mouse
- Zoom: Scroll wheel OR +/- keys
- Select: Click
- Multi-select: Shift + click
- Marquee select: Drag on empty space
- Move: Drag selected
- Resize: Drag handles
- Rotate: Drag outside corner handles

**Keyboard Shortcuts:**
- Ctrl+Z: Undo
- Ctrl+Shift+Z: Redo
- Ctrl+C: Copy
- Ctrl+V: Paste
- Ctrl+X: Cut
- Delete: Delete selected
- Ctrl+G: Group
- Ctrl+Shift+G: Ungroup
- Ctrl+A: Select all
- Ctrl+D: Deselect
- Ctrl+E: Export
- Space: Pan mode (hold)

### 3.4 Data Handling

**Project State:**
- Layers array with properties
- Canvas settings (size, background)
- History stack
- Undo/redo stacks

**Local Storage:**
- Auto-save every 30 seconds
- Recent projects list
- User preferences

### 3.5 Edge Cases

- Empty canvas state (show upload prompt)
- Failed AI extraction (error message + retry)
- Large image handling (downscale for preview, full for export)
- Browser tab close (prompt to save)
- Undo at start/Redo at end (disable buttons)
- Layer name conflicts (auto-rename)

---

## 4. Technical Architecture

### 4.1 Frontend Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Canvas:** Konva.js (react-konva)
- **Icons:** Lucide React

### 4.2 File Structure

```
layerforge-ai/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── canvas/
│   │   │   ├── Canvas.tsx
│   │   │   ├── Layer.tsx
│   │   │   ├── SelectionBox.tsx
│   │   │   └── ContextToolbar.tsx
│   │   ├── panels/
│   │   │   ├── TopBar.tsx
│   │   │   ├── LeftSidebar.tsx
│   │   │   ├── RightSidebar.tsx
│   │   │   ├── AssetPanel.tsx
│   │   │   ├── LayerStack.tsx
│   │   │   └── PropertiesPanel.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Slider.tsx
│   │       ├── Dropdown.tsx
│   │       └── Modal.tsx
│   ├── store/
│   │   ├── useCanvasStore.ts
│   │   ├── useLayerStore.ts
│   │   └── useHistoryStore.ts
│   ├── lib/
│   │   ├── utils.ts
│   │   └── constants.ts
│   └── types/
│       └── index.ts
├── public/
│   └── fonts/
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── next.config.js
```

---

## 5. Acceptance Criteria

### Visual Checkpoints
- [ ] Dark theme applied consistently across all components
- [ ] Three-column layout renders correctly on desktop
- [ ] All buttons have hover states
- [ ] Loading states show appropriate animations
- [ ] Canvas has visible background and grid (when enabled)

### Functional Checkpoints
- [ ] Can upload image via drag & drop
- [ ] Can upload image via file picker
- [ ] Uploaded image appears on canvas
- [ ] Can select, move, and resize layers
- [ ] Layer stack reflects canvas layers
- [ ] Can toggle layer visibility
- [ ] Can reorder layers in stack
- [ ] Undo/Redo works correctly
- [ ] Can export canvas as image
- [ ] Keyboard shortcuts function properly

### AI Feature Checkpoints (Backend Integration)
- [ ] Extract Objects triggers AI pipeline
- [ ] Generative Expand shows canvas resize UI
- [ ] AI Font Match displays OCR results
- [ ] Vector Convert shows SVG preview
- [ ] Smart Select shows refine interface

---

## 6. Out of Scope (v1.0)

- Real backend AI processing (mocked for frontend demo)
- User authentication
- Cloud project saving
- Collaboration features
- Mobile responsive canvas editing
