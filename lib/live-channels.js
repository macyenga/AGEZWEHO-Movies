export const LIVE_CHANNELS = [
  {
    id: 'rwanda-tv',
    label: 'Rwanda TV',
    category: 'Rwanda TV',
    lang: 'KIN / ENG',
    badge: 'RBA HD',
    region: 'Rwanda',
    quality: '1080p',
    url: 'http://197.243.19.131:1935/rtv25/rtv/chunklist.m3u8',
    description: 'National public broadcaster (RBA) — Rwanda news, live events, and cultural programming.',
  },
  {
    id: 'kc2',
    label: 'KC2 (RBA 2)',
    category: 'Rwanda TV',
    lang: 'ENG / KIN',
    badge: 'Entertainment',
    region: 'Rwanda',
    quality: '480p',
    url: 'http://197.243.19.131:1935/kc2/kc2/chunklist.m3u8',
    description: 'Youth, sports, music, and prime-time entertainment from Kigali.',
  },
  {
    id: 'isibo-tv',
    label: 'Isibo TV',
    category: 'Rwanda TV',
    lang: 'KIN',
    badge: 'Kigali Live',
    region: 'Rwanda',
    quality: '480p',
    url: 'https://5c46fa289c89f.streamlock.net/pub2live/myStream/playlist.m3u8',
    description: 'Popular Rwandan urban lifestyle, talk shows, music, and cinema coverage.',
  },
  {
    id: 'tv10',
    label: 'TV10 Rwanda',
    category: 'Rwanda TV',
    lang: 'KIN',
    badge: 'Sports & Showbiz',
    region: 'Rwanda',
    quality: '720p',
    url: 'https://5c46fa289c89f.streamlock.net/pub1live/mystream/playlist.m3u8',
    description: 'Sports analysis, local football coverage, and daily Rwandan news.',
  },
  {
    id: 'bplus-tv',
    label: 'B+ TV',
    category: 'Rwanda TV',
    lang: 'ENG / KIN',
    badge: 'Kigali TV',
    region: 'Rwanda',
    quality: 'HD',
    url: 'https://tv.btnrwanda.com:3432/live/bpluslive.m3u8',
    description: 'Live entertainment, community updates, and diaspora programs.',
  },
  {
    id: 'btn-tv',
    label: 'BTN TV',
    category: 'Rwanda TV',
    lang: 'KIN',
    badge: 'Broadcast',
    region: 'Rwanda',
    quality: 'HD',
    url: 'https://tv.btnrwanda.com:3086/live/btnlive.m3u8',
    fallbackChannelId: 'rwanda-tv',
    description: 'Rwanda local news and live studio shows.',
  },
  {
    id: 'dw-news',
    label: 'DW News 24/7',
    category: 'Global 24/7 Live',
    lang: 'ENG',
    badge: '24/7 News',
    region: 'International',
    quality: '720p',
    url: 'https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8',
    description: 'Continuous international breaking news, documentaries, and global sports updates.',
  },
  {
    id: 'al-jazeera',
    label: 'Al Jazeera English',
    category: 'Global 24/7 Live',
    lang: 'ENG',
    badge: '24/7 World',
    region: 'International',
    quality: 'HD',
    url: 'https://live-hls-apps-aje-fa.getaj.net/AJE/index.m3u8',
    description: 'Live world affairs, Africa coverage, and documentary programming 24 hours a day.',
  },
  {
    id: 'nasa-tv',
    label: 'NASA Live TV',
    category: 'Global 24/7 Live',
    lang: 'ENG',
    badge: 'Space & Science',
    region: 'International',
    quality: 'HD',
    url: 'https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master.m3u8',
    description: 'Live Earth views from the International Space Station and mission broadcasts.',
  },
];

// Exact allowlist of broadcast hosts & CDN domains derived from configured channels (prevents SSRF).
export const ALLOWED_LIVE_HOSTS = new Set([
  '197.243.19.131',
  'tv.btnrwanda.com',
  '5c46fa289c89f.streamlock.net',
  'dwamdstream102.akamaized.net',
  'live-hls-apps-aje-fa.getaj.net',
  'live-hls-web-aje-fa.getaj.net',
  'ntv1.akamaized.net',
]);

export function isPrivateOrLoopbackHostname(hostname) {
  const host = String(hostname || '').trim().toLowerCase();
  if (!host) return true;
  if (
    host === 'localhost' ||
    host === '0.0.0.0' ||
    host === '::1' ||
    host === '[::1]' ||
    host.endsWith('.local') ||
    host.endsWith('.internal')
  ) {
    return true;
  }

  const ipv4Match = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const [, a, b] = ipv4Match.map(Number);
    if (a === 10 || a === 127 || a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a >= 224) return true;
  }

  return false;
}

export function isAllowedLiveStreamUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return false;
  try {
    const parsed = new URL(rawUrl.trim());
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
    if (parsed.username || parsed.password) return false;
    const host = parsed.hostname.toLowerCase();
    if (isPrivateOrLoopbackHostname(host)) return false;
    return ALLOWED_LIVE_HOSTS.has(host);
  } catch {
    return false;
  }
}

export function buildProxyStreamUrl(targetUrl, proxyEndpoint = '/api/live/proxy') {
  if (!isAllowedLiveStreamUrl(targetUrl)) return null;
  return `${proxyEndpoint}?url=${encodeURIComponent(targetUrl)}`;
}

export function getLiveChannelById(id) {
  return LIVE_CHANNELS.find((ch) => ch.id === id) || LIVE_CHANNELS[0];
}

export function rewriteM3u8Manifest(manifestText, baseUrl, proxyEndpoint = '/api/live/proxy') {
  if (!manifestText || typeof manifestText !== 'string') return '';
  if (!isAllowedLiveStreamUrl(baseUrl)) return '';

  const lines = manifestText.split(/\r?\n/);
  const rewritten = lines.map((rawLine) => {
    const trimmed = rawLine.trim();
    if (!trimmed) return rawLine;

    // Rewrite URI="..." inside HLS tags (EXT-X-MEDIA, EXT-X-MAP, EXT-X-KEY, etc.)
    if (trimmed.startsWith('#')) {
      return rawLine.replace(/URI="([^"]+)"/gi, (fullMatch, uriValue) => {
        try {
          const resolved = new URL(uriValue, baseUrl).toString();
          const proxied = buildProxyStreamUrl(resolved, proxyEndpoint);
          return proxied ? `URI="${proxied}"` : fullMatch;
        } catch {
          return fullMatch;
        }
      });
    }

    // Rewrite segment (.ts/.m4s/.aac) or sub-playlist (.m3u8) URL lines
    try {
      const resolved = new URL(trimmed, baseUrl).toString();
      const proxied = buildProxyStreamUrl(resolved, proxyEndpoint);
      return proxied || rawLine;
    } catch {
      return rawLine;
    }
  });

  return rewritten.join('\n');
}

export function selectAutoPlayChannel(channels = LIVE_CHANNELS, statusMap = {}) {
  if (!Array.isArray(channels) || channels.length === 0) return null;

  // Prefer the first verified-online Rwanda channel, then any verified-online channel, then Rwanda TV default
  const onlineRwanda = channels.find(
    (ch) => ch.category === 'Rwanda TV' && statusMap?.[ch.id]?.online === true
  );
  if (onlineRwanda) return onlineRwanda;

  const onlineAny = channels.find((ch) => statusMap?.[ch.id]?.online === true);
  if (onlineAny) return onlineAny;

  return channels[0];
}
