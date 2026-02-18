const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export interface ContentBlock {
  id: string;
  key: string;
  value: string;
  type: 'text' | 'image' | 'rich_text';
  section: string;
}

export async function getContent(section?: string): Promise<ContentBlock[]> {
  const url = section ? `${API_URL}/content?section=${section}` : `${API_URL}/content`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) {
      const msg =
        res.status === 429
          ? 'Too many requests. Please wait a moment and try again.'
          : `Content API error: ${res.status}`;
      throw new Error(msg);
    }
    return res.json();
  } catch (err) {
    clearTimeout(timeout);
    if (typeof window !== 'undefined') {
      console.error('[getContent] Failed to fetch content:', err);
    }
    throw err;
  }
}

export async function getContentByKey(key: string): Promise<ContentBlock> {
  const res = await fetch(`${API_URL}/content/${key}`);
  if (!res.ok) throw new Error('Failed to fetch content');
  return res.json();
}

export function contentMap(blocks: ContentBlock[]): Record<string, string> {
  return Object.fromEntries(blocks.map((b) => [b.key, b.value]));
}
