# LayerFlow Backend

FastAPI proxy for fal.ai Qwen-Image-Layered decomposition.

## Setup

```bash
cd backend
pip install -r requirements.txt
```

## Environment

Set your fal.ai API key:

```bash
export FAL_KEY="your-fal-api-key"
```

Get your key at [fal.ai dashboard](https://fal.ai/dashboard/keys).

## Run

```bash
uvicorn main:app --reload --port 8000
```

## API

### POST /api/decompose

Accepts a multipart image file and returns decomposed RGBA layer URLs.

**Request:** `multipart/form-data` with `image` file, optional `num_layers` (default 5), `resolution` (default 640)

**Response:**
```json
{
  "layers": ["https://...", "https://...", ...],
  "count": 5
}
```
