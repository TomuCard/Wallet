import { getBrandfetchKey } from './settings';

const FALLBACK_PALETTE = [
  '#7B6EF6', '#FF6B9D', '#FFB347', '#47D5FF',
  '#6BCB77', '#FF8B94', '#C9A0DC', '#FFD700',
  '#00CED1', '#FF7F50',
];

const cache: Record<string, string> = {};

function hashColor(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash);
  }
  return FALLBACK_PALETTE[Math.abs(hash) % FALLBACK_PALETTE.length];
}

export async function getDominantColor(domain: string): Promise<string> {
  if (cache[domain]) return cache[domain];

  const apiKey = await getBrandfetchKey();
  if (!apiKey) return hashColor(domain);

  try {
    const res = await fetch(`https://api.brandfetch.io/v2/brands/${domain}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    const brandColor = data.colors?.find((c: any) => c.type === 'brand') ?? data.colors?.[0];
    const color = brandColor?.hex ?? hashColor(domain);
    cache[domain] = color;
    return color;
  } catch {
    return hashColor(domain);
  }
}
