import {
  isAllowedLiveStreamUrl,
  rewriteM3u8Manifest,
} from '../../../lib/live-channels';

export const config = {
  api: {
    responseLimit: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', ['GET', 'HEAD']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const targetUrl = typeof req.query.url === 'string' ? req.query.url.trim() : '';
  if (!isAllowedLiveStreamUrl(targetUrl)) {
    return res.status(403).json({ error: 'Broadcast host is not in the verified Live TV allowlist.' });
  }

  try {
    let currentUrl = targetUrl;
    let upstream = null;

    for (let hops = 0; hops < 3; hops++) {
      upstream = await fetch(currentUrl, {
        method: req.method,
        redirect: 'manual',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; AgasobanuyeLiveRelay/1.0)',
          Accept: 'application/vnd.apple.mpegurl, application/x-mpegURL, video/mp2t, */*',
        },
        signal: AbortSignal.timeout(8500),
      });

      if (upstream.status >= 300 && upstream.status < 400) {
        const location = upstream.headers.get('location');
        if (!location) break;
        const resolvedRedirect = new URL(location, currentUrl).toString();
        if (!isAllowedLiveStreamUrl(resolvedRedirect)) {
          return res.status(403).json({ error: 'Redirect target is not in the Live TV allowlist.' });
        }
        currentUrl = resolvedRedirect;
        continue;
      }
      break;
    }

    if (!upstream || !upstream.ok) {
      return res.status(upstream?.status || 502).json({
        error: 'Upstream live broadcast temporarily unavailable.',
      });
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Cache-Control', 'no-store, max-age=0');

    const contentType = (upstream.headers.get('content-type') || '').toLowerCase();
    const isPlaylist =
      contentType.includes('mpegurl') ||
      contentType.includes('m3u') ||
      /\.m3u8(\?|$)/i.test(currentUrl);

    if (isPlaylist) {
      const text = await upstream.text();
      if (!text.includes('#EXTM3U')) {
        return res.status(502).json({ error: 'Upstream response is not a valid HLS playlist.' });
      }
      const rewritten = rewriteM3u8Manifest(text, currentUrl, '/api/live/proxy');
      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl; charset=utf-8');
      return res.status(200).send(rewritten);
    }

    const buffer = Buffer.from(await upstream.arrayBuffer());
    res.setHeader('Content-Type', contentType || 'video/mp2t');
    return res.status(200).send(buffer);
  } catch {
    return res.status(502).json({ error: 'Could not reach live broadcast server.' });
  }
}
