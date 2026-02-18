export interface DecomposeResponse {
  layers: string[];
  count: number;
}

/** Call decompose via Next.js API route (same origin, no CORS). */
export async function decomposeImage(
  file: File,
  numLayers: number = 5
): Promise<DecomposeResponse> {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('num_layers', String(numLayers));

  const res = await fetch('/api/decompose', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `Decomposition failed (${res.status})`);
  }

  return res.json();
}
