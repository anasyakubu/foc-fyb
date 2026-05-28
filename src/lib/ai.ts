export async function enhanceImage(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      const ctx = c.getContext('2d')!;
      ctx.filter = 'brightness(1.05) contrast(1.10) saturate(1.14)';
      ctx.drawImage(img, 0, 0);
      ctx.filter = 'none';
      const id = ctx.getImageData(0, 0, c.width, c.height);
      const d = id.data; const w = c.width;
      const src = new Uint8ClampedArray(d);
      const amt = 0.32;
      for (let y = 1; y < c.height - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const i = (y * w + x) * 4;
          for (let k = 0; k < 3; k++) {
            const center = src[i + k];
            const blur = (src[i - 4 + k] + src[i + 4 + k] + src[i - w * 4 + k] + src[i + w * 4 + k]) / 4;
            d[i + k] = Math.max(0, Math.min(255, center + (center - blur) * amt));
          }
        }
      }
      ctx.putImageData(id, 0, 0);
      resolve(c.toDataURL('image/jpeg', 0.92));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

async function claude(prompt: string): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  const data = await res.json();
  return (data.content || []).filter((b: any) => b.type === 'text').map((b: any) => b.text).join('').trim();
}

export async function polishProfile(fields: Record<string, string>): Promise<Record<string, string>> {
  const prompt = `You are helping fill an FYB (Final Year Brethren) "Personality of the Week" profile for a final-year student at Bayero University Kano, Faculty of Computing (Class of 2022).
Given these raw fields, return ONLY a JSON object (no markdown, no backticks) with the same keys: cleaning up capitalization, fixing obvious typos, keeping values concise. If "quote" is empty, write a short, elegant 1-line quote (no clichés).
Fields: ${JSON.stringify(fields)}`;
  try {
    const out = await claude(prompt);
    return JSON.parse(out.replace(/```json|```/g, '').trim());
  } catch {
    return fields;
  }
}
