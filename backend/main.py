"""
LayerFlow / LayerForge AI - FastAPI Backend
Qwen-Image-Layered: fal.ai (with FAL_KEY) or local Hugging Face (GPU, no key).
"""

import asyncio
import base64
import os
from pathlib import Path

from dotenv import load_dotenv

# Load .env from backend directory
load_dotenv(Path(__file__).resolve().parent / ".env")

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="LayerFlow API",
    description="AI-powered image decomposition into editable RGBA layers",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def file_to_data_uri(content: bytes, media_type: str = "image/png") -> str:
    """Convert file bytes to a data URI for fal.ai API."""
    b64 = base64.b64encode(content).decode("utf-8")
    return f"data:{media_type};base64,{b64}"


def get_media_type(filename: str) -> str:
    """Infer media type from filename."""
    ext = filename.lower().split(".")[-1] if "." in filename else ""
    return {
        "png": "image/png",
        "jpg": "image/jpeg",
        "jpeg": "image/jpeg",
        "webp": "image/webp",
        "gif": "image/gif",
        "avif": "image/avif",
    }.get(ext, "image/png")


@app.get("/health")
async def health():
    """Health check endpoint."""
    mode = "local" if (not os.getenv("FAL_KEY") or os.getenv("USE_LOCAL_MODEL")) else "fal.ai"
    return {"status": "ok", "service": "layerflow-api", "mode": mode}


def _decompose_via_fal(content: bytes, media_type: str, num_layers: int):
    """Use fal.ai API (requires FAL_KEY)."""
    import fal_client

    image_data_uri = file_to_data_uri(content, media_type)
    result = fal_client.subscribe(
        "fal-ai/qwen-image-layered",
        arguments={
            "image_url": image_data_uri,
            "num_layers": num_layers,
            "output_format": "png",
            "acceleration": "high",
            },
    )
    data = result.get("data", result)
    images = data.get("images", [])
    return [img["url"] for img in images if isinstance(img, dict) and img.get("url")]


def _decompose_via_local(content: bytes, num_layers: int):
    """Use local Hugging Face diffusers (no API key, requires GPU)."""
    from decompose_local import decompose_image_local
    return decompose_image_local(content, num_layers)


@app.post("/api/decompose")
async def decompose(
    image: UploadFile = File(...),
    num_layers: int = Form(5),
):
    """
    Decompose a flat image into editable RGBA layers.
    Uses fal.ai if FAL_KEY is set, else local Hugging Face model (GPU required).
    Returns JSON with array of layer URLs or data URIs.
    """
    ctype = (image.content_type or "").lower()
    if ctype and not ctype.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Only image files (PNG, JPEG, WebP, GIF, AVIF) are supported.",
        )

    content = await image.read()
    media_type = get_media_type(image.filename or "image.png")
    use_fal = bool(os.getenv("FAL_KEY")) and not os.getenv("USE_LOCAL_MODEL")

    try:
        if use_fal:
            urls = _decompose_via_fal(content, media_type, num_layers)
        else:
            urls = await asyncio.to_thread(_decompose_via_local, content, num_layers)

        if not urls:
            raise ValueError("No layers returned")

        return {"layers": urls, "count": len(urls)}

    except HTTPException:
        raise
    except ImportError as e:
        raise HTTPException(
            503,
            f"Local mode deps missing. Run: pip install -r requirements-local.txt. Or set FAL_KEY for fal.ai. {e}",
        )
    except Exception as e:
        msg = str(e)
        if "No user found" in msg or "auth" in msg.lower() or "Key" in msg:
            raise HTTPException(
                401,
                "Invalid FAL_KEY. Get a key at https://fal.ai/dashboard/keys or use local mode (remove FAL_KEY, GPU required).",
            )
        if "CUDA" in msg or "GPU" in msg:
            raise HTTPException(503, "Local mode needs GPU. Set FAL_KEY for cloud inference.")
        raise HTTPException(status_code=502, detail=f"Decomposition failed: {msg}")
