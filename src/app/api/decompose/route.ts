/**
 * Next.js API route proxy for decompose.
 * Forwards to FastAPI backend (Qwen-Image-Layered via fal.ai).
 */
const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://127.0.0.1:8000';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const res = await fetch(`${BACKEND_URL}/api/decompose`, {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(120000), // 2 min for fal.ai inference
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return Response.json(
        { detail: data.detail || res.statusText },
        { status: res.status }
      );
    }
    return Response.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Decomposition failed';
    return Response.json(
      { detail: `Backend error: ${message}. Is the FastAPI server running on ${BACKEND_URL}?` },
      { status: 502 }
    );
  }
}
