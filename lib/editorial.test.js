import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractExternalDomain,
  classifyExternalLinkAttribution,
  resolvePreviewSourcesWithTrailerFallback,
  buildMovieEditorialGuide,
  evaluateAdsenseReadiness,
  buildMovieFaqs,
  buildMovieFaqJsonLd,
} from './editorial.js';

test('extractExternalDomain and classifyExternalLinkAttribution label third-party links transparently', () => {
  assert.equal(extractExternalDomain('https://www.youtube.com/watch?v=g3JUbgOHgdw'), 'youtube.com');
  assert.equal(extractExternalDomain('https://drive.google.com/file/d/abc/view'), 'drive.google.com');

  const cloud = classifyExternalLinkAttribution('https://drive.google.com/file/d/abc/view', '1080p Mirror');
  assert.equal(cloud.category, 'Cloud File Mirror');
  assert.ok(cloud.rel.includes('nofollow'));
  assert.ok(cloud.rel.includes('ugc'));

  const official = classifyExternalLinkAttribution('https://www.netflix.com/search?q=pushpa', 'Netflix');
  assert.equal(official.category, 'Official Streaming Platform');
});

test('resolvePreviewSourcesWithTrailerFallback falls back cleanly to matched movie trailer when links are external only', () => {
  const sources = resolvePreviewSourcesWithTrailerFallback({
    id: 'mirzapur-s3',
    title: 'Mirzapur Season 3',
    watch_links: [{ label: 'Prime Video', url: 'https://www.primevideo.com' }],
  });
  assert.equal(sources.length, 1);
  assert.equal(sources[0].kind, 'youtube');
  assert.match(sources[0].embedUrl, /33o3s4Vs4Sw/);
});

test('buildMovieEditorialGuide and evaluateAdsenseReadiness generate editorial context and compliance checks', () => {
  const guide = buildMovieEditorialGuide({
    id: 'pushpa-2-the-rule',
    title: 'Pushpa 2: The Rule',
    type: 'Movie',
    year: '2024',
    genre: 'Action',
    language: 'Telugu/Hindi',
    uploaded_by: 'Rocky Kimomo',
    overview: 'Pushpa Raj expands his red-sandalwood empire and confronts a fierce new rival in this action sequel.',
    poster_url: 'https://example.com/poster.jpg',
    subtitles: [{ language: 'Kinyarwanda', url: '/api/subtitles/sample?lang=rw' }],
  });

  assert.match(guide.narrationNote, /Pushpa 2: The Rule/);
  assert.match(guide.externalLinkDisclosure, /third-party platforms/i);
  assert.equal(guide.facts.length, 5);

  const readiness = evaluateAdsenseReadiness({
    id: 'pushpa-2-the-rule',
    title: 'Pushpa 2: The Rule',
    overview: 'Pushpa Raj expands his red-sandalwood empire and confronts a fierce new rival in this action sequel.',
    poster_url: 'https://example.com/poster.jpg',
    uploaded_by: 'Rocky Kimomo',
  });
  assert.equal(readiness.passed, true);
  assert.equal(readiness.score, 100);
});

test('buildMovieFaqs and buildMovieFaqJsonLd generate valid Schema.org FAQPage structured data', () => {
  assert.deepEqual(buildMovieFaqs(null), []);
  assert.equal(buildMovieFaqJsonLd({}), null);

  const movie = {
    id: 'agasobanuye-rocky-2026-agent',
    title: 'Agasobanuye: Rocky 2026 — The Agent',
    type: 'Movie',
    year: '2026',
    genre: 'Action',
    language: 'Kinyarwanda',
    uploaded_by: 'Rocky Studio',
    overview: 'Agasobanuye gashya 2026 kasobanuwe na Rocky Kimomo.',
    subtitles: [{ language: 'Kinyarwanda', url: '/api/subtitles/sample?lang=rw' }],
    platforms: ['YouTube'],
    watch_links: [{ label: 'Watch Online', url: 'https://www.youtube.com/watch?v=g3JUbgOHgdw' }],
  };

  const faqs = buildMovieFaqs(movie);
  assert.equal(faqs.length, 5);
  assert.match(faqs[0].question, /Agasobanuye: Rocky 2026/);
  assert.match(faqs[1].answer, /Rocky Studio/);
  assert.match(faqs[2].answer, /1 attached subtitle track/);
  assert.match(faqs[3].answer, /YouTube/);

  const schema = buildMovieFaqJsonLd(movie);
  assert.equal(schema['@context'], 'https://schema.org');
  assert.equal(schema['@type'], 'FAQPage');
  assert.equal(schema.mainEntity.length, 5);
  for (const item of schema.mainEntity) {
    assert.equal(item['@type'], 'Question');
    assert.ok(item.name.length > 10);
    assert.equal(item.acceptedAnswer['@type'], 'Answer');
    assert.ok(item.acceptedAnswer.text.length > 20);
  }
});
