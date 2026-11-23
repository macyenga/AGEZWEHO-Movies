import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeExternalUrl,
  resolveWhatsAppSocialUrl,
  getSocialConfig,
  getSocialLinks,
  getAllSocialLinks,
} from './social-config.js';

test('normalizeExternalUrl validates URLs and safely blocks non-HTTP schemes', () => {
  assert.equal(
    normalizeExternalUrl('https://www.instagram.com/agasobanuye_official/', 'https://fallback.test'),
    'https://www.instagram.com/agasobanuye_official/'
  );
  assert.equal(
    normalizeExternalUrl('tiktok.com/@agasobanuyerw', 'https://fallback.test'),
    'https://tiktok.com/@agasobanuyerw'
  );
  assert.equal(
    normalizeExternalUrl('javascript:alert(1)', 'https://fallback.test'),
    'https://fallback.test'
  );
  assert.equal(normalizeExternalUrl('', 'https://fallback.test'), 'https://fallback.test');
});

test('resolveWhatsAppSocialUrl prioritizes NEXT_PUBLIC_WHATSAPP_LINK and normalizes phone fallback', () => {
  assert.equal(
    resolveWhatsAppSocialUrl({
      whatsappLink: 'https://wa.me/250788392120',
      whatsappNumber: '0780000000',
    }),
    'https://wa.me/250788392120'
  );

  assert.equal(
    resolveWhatsAppSocialUrl({
      whatsappLink: '',
      whatsappNumber: '0788392120',
    }),
    'https://wa.me/250788392120'
  );
});

test('getSocialLinks builds WhatsApp, Instagram, and TikTok links from config keys', () => {
  const links = getSocialLinks({
    merchantName: 'Agasobanuye',
    whatsappLink: 'https://wa.me/250788392120',
    instagramUrl: 'https://www.instagram.com/agasobanuye.rw/',
    tiktokUrl: 'https://www.tiktok.com/@agasobanuye.rw',
  });

  assert.equal(links.length, 3);
  assert.deepEqual(
    links.map((l) => l.id),
    ['whatsapp', 'instagram', 'tiktok']
  );
  assert.equal(links[0].href, 'https://wa.me/250788392120');
  assert.equal(links[1].href, 'https://www.instagram.com/agasobanuye.rw/');
  assert.equal(links[2].href, 'https://www.tiktok.com/@agasobanuye.rw');
  assert.match(links[0].ariaLabel, /Agasobanuye/);
});

test('getAllSocialLinks places Telegram first followed by all remaining social platforms', () => {
  const links = getAllSocialLinks();
  assert.deepEqual(
    links.map((l) => l.id),
    ['telegram', 'whatsapp', 'instagram', 'tiktok', 'youtube', 'facebook', 'x']
  );
  assert.ok(links[0].href.startsWith('https://t.me/'));
  assert.ok(links.every((l) => l.href.startsWith('https://')));
});

test('getSocialConfig supplies safe defaults when optional keys are blank', () => {
  const cfg = getSocialConfig({
    telegramUrl: '',
    whatsappLink: '',
    whatsappNumber: '',
    instagramUrl: '',
    tiktokUrl: '',
    youtubeUrl: '',
    facebookUrl: '',
    xUrl: '',
    siteUrl: '',
  });
  assert.equal(cfg.merchantName, 'Agasobanuye');
  assert.ok(cfg.telegramUrl.startsWith('https://t.me/'));
  assert.equal(cfg.whatsappUrl, 'https://wa.me/250789690247');
  assert.match(cfg.instagramUrl, /^https:\/\/www\.instagram\.com\//);
  assert.match(cfg.tiktokUrl, /^https:\/\/www\.tiktok\.com\//);
  assert.match(cfg.youtubeUrl, /^https:\/\/www\.youtube\.com\//);
  assert.match(cfg.facebookUrl, /^https:\/\/www\.facebook\.com\//);
  assert.match(cfg.xUrl, /^https:\/\/x\.com\//);
  assert.equal(cfg.siteUrl, 'https://agasobanuye.rw');
});
