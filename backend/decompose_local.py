"""
Local Qwen-Image-Layered via Hugging Face diffusers.
No API key required. Requires GPU (CUDA) for reasonable speed.
"""

import base64
import io
from typing import List

from PIL import Image


def decompose_image_local(content: bytes, num_layers: int = 5) -> List[str]:
    """
    Decompose image using Qwen/Qwen-Image-Layered from Hugging Face.
    Returns list of data URIs (data:image/png;base64,...).
    """
    try:
        from diffusers import QwenImageLayeredPipeline
        import torch
    except ImportError as e:
        raise ImportError(
            "Local mode requires: pip install diffusers transformers torch accelerate pillow. "
            "See backend/requirements-local.txt"
        ) from e

    device = "cuda" if torch.cuda.is_available() else "cpu"
    if device == "cpu":
        raise RuntimeError(
            "Local mode requires CUDA GPU. Use fal.ai (set FAL_KEY) for CPU-only machines."
        )

    # Load image
    img = Image.open(io.BytesIO(content)).convert("RGBA")

    # Load pipeline (cached after first run)
    pipeline = QwenImageLayeredPipeline.from_pretrained("Qwen/Qwen-Image-Layered")
    pipeline = pipeline.to(device, torch.bfloat16 if device == "cuda" else torch.float32)

    inputs = {
        "image": img,
        "generator": torch.Generator(device=device).manual_seed(42),
        "true_cfg_scale": 4.0,
        "negative_prompt": " ",
        "num_inference_steps": 50,
        "num_images_per_prompt": 1,
        "layers": num_layers,
        "resolution": 640,
        "cfg_normalize": True,
        "use_en_prompt": True,
    }

    with torch.inference_mode():
        output = pipeline(**inputs)

    # output.images is list of batches; each batch is list of PIL Images
    layer_images = output.images[0] if output.images else []

    result = []
    for layer_img in layer_images:
        buf = io.BytesIO()
        layer_img.save(buf, format="PNG")
        b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
        result.append(f"data:image/png;base64,{b64}")

    return result
