import { PAYPACK_CLIENT_CONFIG } from './paypack-client.js';

export const SOCIAL_DEFAULTS = {
  telegramUrl: 'https://t.me/+n3etNnm3RxI5NGZl',
  telegramPhone: '+250789690247',
  telegramDirectUrl: 'https://t.me/+250789690247',
  whatsappNumber: '250789690247',
  whatsappPhoneDisplay: '+250 789 690 247',
  contactEmail: 'macyenga@gmail.com',
  instagramUrl: 'https://www.instagram.com/agasobanuye.rw/',
  tiktokUrl: 'https://www.tiktok.com/@agasobanuye.rw',
  youtubeUrl: 'https://www.youtube.com/@agasobanuyerw',
  facebookUrl: 'https://www.facebook.com/agasobanuye.rw',
  xUrl: 'https://x.com/agasobanuyerw',
  siteUrl: 'https://agasobanuye.rw',
};

export const ABROAD_TRANSFER_APPS = [
  'Remitly',
  'WorldRemit',
  'Sendwave',
  'TapTap Send',
  'Western Union',
];

export function normalizeExternalUrl(rawUrl, fallbackUrl) {
  const value = typeof rawUrl === 'string' ? rawUrl.trim() : '';
  if (!value) return fallbackUrl;

  const candidate = /^https?:\/\//i.test(value)
    ? value
    : !value.includes(':') && value.includes('.')
    ? `https://${value.replace(/^\/+/, '')}`
    : value;

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
  } catch {
    // Fall back on invalid URLs
  }

  return fallbackUrl;
}

export function resolveWhatsAppSocialUrl({
  whatsappLink = PAYPACK_CLIENT_CONFIG.whatsappLink,
  whatsappNumber = PAYPACK_CLIENT_CONFIG.whatsappNumber,
} = {}) {
  const link = typeof whatsappLink === 'string' ? whatsappLink.trim() : '';
  if (link && /^https?:\/\//i.test(link)) {
    try {
      const parsed = new URL(link);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return parsed.toString();
      }
    } catch {
      // Fall through to number normalization
    }
  }

  const digits = String(whatsappNumber || SOCIAL_DEFAULTS.whatsappNumber).replace(/\D/g, '');
  if (!digits) {
    return `https://wa.me/${SOCIAL_DEFAULTS.whatsappNumber}`;
  }
  const cleanNumber = digits.startsWith('250')
    ? digits
    : digits.startsWith('0')
    ? `250${digits.slice(1)}`
    : `250${digits}`;

  return `https://wa.me/${cleanNumber}`;
}

export function getSocialConfig(overrides = {}) {
  const merchantName =
    (overrides.merchantName ?? 'Agasobanuye').trim() ||
    'Agasobanuye';

  const siteUrl = normalizeExternalUrl(
    overrides.siteUrl ?? process.env.NEXT_PUBLIC_SITE_URL,
    SOCIAL_DEFAULTS.siteUrl
  );

  const telegramUrl = normalizeExternalUrl(
    overrides.telegramUrl ?? process.env.NEXT_PUBLIC_TELEGRAM_URL,
    SOCIAL_DEFAULTS.telegramUrl
  );

  const telegramDirectUrl = normalizeExternalUrl(
    overrides.telegramDirectUrl ?? process.env.NEXT_PUBLIC_TELEGRAM_DIRECT_URL,
    SOCIAL_DEFAULTS.telegramDirectUrl
  );

  const telegramPhone =
    String(overrides.telegramPhone ?? process.env.NEXT_PUBLIC_TELEGRAM_PHONE ?? SOCIAL_DEFAULTS.telegramPhone).trim() ||
    SOCIAL_DEFAULTS.telegramPhone;

  const contactEmail =
    String(overrides.contactEmail ?? process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? SOCIAL_DEFAULTS.contactEmail).trim() ||
    SOCIAL_DEFAULTS.contactEmail;

  const whatsappUrl = resolveWhatsAppSocialUrl({
    whatsappLink: overrides.whatsappLink ?? PAYPACK_CLIENT_CONFIG.whatsappLink,
    whatsappNumber: overrides.whatsappNumber ?? PAYPACK_CLIENT_CONFIG.whatsappNumber,
  });

  const instagramUrl = normalizeExternalUrl(
    overrides.instagramUrl ?? process.env.NEXT_PUBLIC_INSTAGRAM_URL,
    SOCIAL_DEFAULTS.instagramUrl
  );

  const tiktokUrl = normalizeExternalUrl(
    overrides.tiktokUrl ?? process.env.NEXT_PUBLIC_TIKTOK_URL,
    SOCIAL_DEFAULTS.tiktokUrl
  );

  const youtubeUrl = normalizeExternalUrl(
    overrides.youtubeUrl ?? process.env.NEXT_PUBLIC_YOUTUBE_URL,
    SOCIAL_DEFAULTS.youtubeUrl
  );

  const facebookUrl = normalizeExternalUrl(
    overrides.facebookUrl ?? process.env.NEXT_PUBLIC_FACEBOOK_URL,
    SOCIAL_DEFAULTS.facebookUrl
  );

  const xUrl = normalizeExternalUrl(
    overrides.xUrl ?? process.env.NEXT_PUBLIC_X_URL,
    SOCIAL_DEFAULTS.xUrl
  );

  return {
    merchantName,
    siteUrl,
    telegramUrl,
    telegramDirectUrl,
    telegramPhone,
    whatsappPhoneDisplay: SOCIAL_DEFAULTS.whatsappPhoneDisplay,
    contactEmail,
    whatsappUrl,
    instagramUrl,
    tiktokUrl,
    youtubeUrl,
    facebookUrl,
    xUrl,
  };
}

export function getDirectContactChannels(overrides = {}) {
  const cfg = getSocialConfig(overrides);
  return [
    {
      id: 'telegram-direct',
      name: 'Telegram Direct',
      handle: cfg.telegramPhone,
      href: cfg.telegramDirectUrl,
      copyValue: cfg.telegramPhone,
      description: 'Talk directly to our team from Rwanda or abroad',
    },
    {
      id: 'whatsapp-direct',
      name: 'WhatsApp',
      handle: cfg.whatsappPhoneDisplay,
      href: cfg.whatsappUrl,
      copyValue: cfg.telegramPhone,
      description: 'Fast chat & receipt confirmation',
    },
    {
      id: 'telegram-channel',
      name: 'Telegram Channel',
      handle: 'Official Releases',
      href: cfg.telegramUrl,
      copyValue: cfg.telegramUrl,
      description: 'Join new movie & live updates',
    },
    {
      id: 'email-direct',
      name: 'Email',
      handle: cfg.contactEmail,
      href: `mailto:${cfg.contactEmail}`,
      copyValue: cfg.contactEmail,
      description: 'Partnerships, diaspora support & inquiries',
    },
  ];
}

export function getSocialLinks(overrides = {}) {
  const config = getSocialConfig(overrides);

  return [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      href: config.whatsappUrl,
      ariaLabel: `Chat with ${config.merchantName} on WhatsApp`,
      accentColor: '#25D366',
      bgColor: 'rgba(37, 211, 102, 0.1)',
      borderColor: 'rgba(37, 211, 102, 0.28)',
    },
    {
      id: 'instagram',
      name: 'Instagram',
      href: config.instagramUrl,
      ariaLabel: `Follow ${config.merchantName} on Instagram`,
      accentColor: '#E1306C',
      bgColor: 'rgba(225, 48, 108, 0.1)',
      borderColor: 'rgba(225, 48, 108, 0.28)',
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      href: config.tiktokUrl,
      ariaLabel: `Follow ${config.merchantName} on TikTok`,
      accentColor: '#25F4EE',
      bgColor: 'rgba(37, 244, 238, 0.08)',
      borderColor: 'rgba(37, 244, 238, 0.26)',
    },
  ];
}

export function getAllSocialLinks(overrides = {}) {
  const config = getSocialConfig(overrides);

  return [
    {
      id: 'telegram',
      name: 'Telegram',
      href: config.telegramUrl,
      ariaLabel: `Join ${config.merchantName} on Telegram`,
      accentColor: '#38bdf8',
      bgColor: 'rgba(56, 189, 248, 0.1)',
      borderColor: 'rgba(56, 189, 248, 0.28)',
    },
    ...getSocialLinks(overrides),
    {
      id: 'youtube',
      name: 'YouTube',
      href: config.youtubeUrl,
      ariaLabel: `Subscribe to ${config.merchantName} on YouTube`,
      accentColor: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.1)',
      borderColor: 'rgba(239, 68, 68, 0.28)',
    },
    {
      id: 'facebook',
      name: 'Facebook',
      href: config.facebookUrl,
      ariaLabel: `Follow ${config.merchantName} on Facebook`,
      accentColor: '#60a5fa',
      bgColor: 'rgba(96, 165, 250, 0.1)',
      borderColor: 'rgba(96, 165, 250, 0.28)',
    },
    {
      id: 'x',
      name: 'X',
      href: config.xUrl,
      ariaLabel: `Follow ${config.merchantName} on X`,
      accentColor: '#e7e2d4',
      bgColor: 'rgba(241, 237, 226, 0.08)',
      borderColor: 'rgba(241, 237, 226, 0.24)',
    },
  ];
}
