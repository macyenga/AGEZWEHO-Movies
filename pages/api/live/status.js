import {
  LIVE_CHANNELS,
  buildProxyStreamUrl,
  selectAutoPlayChannel,
} from '../../../lib/live-channels';

let cachedStatusPayload = null;
let cachedAtMs = 0;
const STATUS_CACHE_TTL_MS = 45000;

async function probeChannel(channel) {
  const startedAt = Date.now();
  try {
    const response = await fetch(channel.url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AgasobanuyeLiveProbe/1.0)',
      },
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) {
      return { id: channel.id, online: false, statusCode: response.status, latencyMs: Date.now() - startedAt };
    }
    const snippet = await response.text();
    const online = snippet.includes('#EXTM3U');
    return {
      id: channel.id,
      online,
      statusCode: response.status,
      latencyMs: Date.now() - startedAt,
    };
  } catch {
    return {
      id: channel.id,
      online: false,
      statusCode: 0,
      latencyMs: Date.now() - startedAt,
    };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const now = Date.now();
  if (cachedStatusPayload && now - cachedAtMs < STATUS_CACHE_TTL_MS) {
    res.setHeader('Cache-Control', 'public, max-age=15');
    return res.status(200).json(cachedStatusPayload);
  }

  const results = await Promise.all(LIVE_CHANNELS.map(probeChannel));
  const statusMap = {};
  for (const item of results) {
    statusMap[item.id] = item;
  }

  const channels = LIVE_CHANNELS.map((ch) => ({
    ...ch,
    proxyUrl: buildProxyStreamUrl(ch.url),
    online: Boolean(statusMap[ch.id]?.online),
    latencyMs: statusMap[ch.id]?.latencyMs || null,
  }));

  const recommended = selectAutoPlayChannel(channels, statusMap);

  cachedStatusPayload = {
    channels,
    recommendedChannelId: recommended?.id || channels[0]?.id || null,
    checkedAt: new Date(now).toISOString(),
  };
  cachedAtMs = now;

  res.setHeader('Cache-Control', 'public, max-age=15');
  return res.status(200).json(cachedStatusPayload);
}
