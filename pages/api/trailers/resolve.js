import { extractYouTubeVideoId } from '../../../lib/trailers';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title = '', year = '' } = req.query;
  const searchQuery = [String(title).trim(), String(year).trim(), 'official trailer']
    .filter(Boolean)
    .join(' ');

  if (!searchQuery) {
    return res.status(400).json({ error: 'Missing title' });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const resp = await fetch(
      `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`,
      {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; AgasobanuyeBot/1.0)',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      }
    );
    clearTimeout(timeout);

    if (!resp.ok) {
      return res.status(200).json({ videoId: null });
    }

    const html = await resp.text();
    const match = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
    const videoId = match && extractYouTubeVideoId(match[1]) ? match[1] : null;
    return res.status(200).json({ videoId });
  } catch {
    return res.status(200).json({ videoId: null });
  }
}
