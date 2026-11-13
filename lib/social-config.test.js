import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeExternalUrl,
  resolveWhatsAppSocialUrl,
  getSocialConfig,
  getSocialLinks,
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

test('getSocialConfig supplies safe defaults when optional keys are blank', () => {
  const cfg = getSocialConfig({
    whatsappLink: '',
    whatsappNumber: '',
    instagramUrl: '',
    tiktokUrl: '',
    siteUrl: '',
  });
  assert.equal(cfg.merchantName, 'Agasobanuye');
  assert.equal(cfg.whatsappUrl, 'https://wa.me/250788392120');
  assert.match(cfg.instagramUrl, /^https:\/\/www\.instagram\.com\//);
  assert.match(cfg.tiktokUrl, /^https:\/\/www\.tiktok\.com\//);
  assert.equal(cfg.siteUrl, 'https://agasobanuye.rw');
});
