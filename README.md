# LayerFlow / LayerForge AI

AI-powered design platform that decomposes flat images into editable RGBA layers using [Qwen-Image-Layered](https://huggingface.co/Qwen/Qwen-Image-Layered).

## Quick Start

### 1. Backend (FastAPI)

**Option A: fal.ai (cloud, no GPU)** – requires API key

```bash
cd backend
pip install -r requirements.txt
# Add FAL_KEY to .env (get at https://fal.ai/dashboard/keys)
python -m uvicorn main:app --reload --port 8000
```

**Option B: Local Hugging Face (no API key)** – requires CUDA GPU

```bash
cd backend
pip install -r requirements.txt requirements-local.txt
# Leave FAL_KEY empty in .env (or set USE_LOCAL_MODEL=1)
python -m uvicorn main:app --reload --port 8000
```

### 2. Frontend (Next.js)

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Drop an image into the upload zone to decompose it into 5 editable layers.

### API URL

The frontend calls the backend at `http://localhost:8000` by default. To change it, set `NEXT_PUBLIC_API_URL` in `.env.local`.

## Features

- **AI Decomposition**: Drop an image → get 5 transparent PNG layers
- **Konva Canvas**: Resize, rotate, move layers with the transformer
- **Layer Panel**: Toggle visibility, reorder, rename
- **Context Menu**: Flip Horizontal, Bring to Front, Delete
- **Undo/Redo**: Full history support
