import { supabaseAdmin } from '../../../lib/server/supabase-admin';
import { searchOfficialSubtitles } from '../../../lib/server/official-subtitles';

const LATEST_SEED_TITLES = [
  'Pushpa 2: The Rule',
  'Stree 2',
  'Mirzapur',
  'Animal',
  'Squid Game',
];

function cleanSearchTitle(rawTitle) {
  return String(rawTitle || '')
    .replace(/^Agasobanuye\s*:\s*/i, '')
    .replace(/\b(Rocky|Sankara|Gashya|Junior Giti)\s*20\d{2}\b/gi, '')
    .replace(/\s*[—–-]\s*(The Agent|Bloodline).*$/i, '')
    .replace(/Season\s+\d+/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const rawQuery = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  const imdbId = typeof req.query.imdbId === 'string' ? req.query.imdbId.trim() : '';
  const lang = typeof req.query.lang === 'string' ? req.query.lang.trim().toLowerCase() : 'eng';
  const latestMode = req.query.latest === '1' || (!rawQuery && !imdbId);

  try {
    const { data: siteMovies } = await supabaseAdmin
      .from('movies')
      .select('id, title, year, type, language, poster_url, created_at')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(20);

    const catalog = Array.isArray(siteMovies) ? siteMovies : [];

    const attachMatchedMovie = (subItem) => {
      const normalizedSubName = String(subItem.movieName || '').toLowerCase();
      const matched = catalog.find((m) => {
        const cleanSite = cleanSearchTitle(m.title).toLowerCase();
        return cleanSite && (normalizedSubName.includes(cleanSite) || cleanSite.includes(normalizedSubName));
      });
      return {
        ...subItem,
        matchedMovieId: matched?.id || null,
        matchedMovieTitle: matched?.title || null,
        posterUrl: matched?.poster_url || null,
      };
    };

    if (!latestMode) {
      const cleanQ = cleanSearchTitle(rawQuery) || rawQuery;
      const items = await searchOfficialSubtitles({
        query: cleanQ,
        imdbId,
        lang,
        limit: 20,
      });

      return res.status(200).json({
        mode: 'search',
        query: rawQuery,
        lang,
        items: items.map(attachMatchedMovie),
        catalogQuickPicks: catalog.slice(0, 6).map((m) => ({
          id: m.id,
          title: m.title,
          searchHint: cleanSearchTitle(m.title) || m.title,
          year: m.year,
        })),
      });
    }

    // Latest official subtitles mode: query top recent catalog releases + trending international titles
    const candidateTitles = [];
    for (const m of catalog) {
      const cleaned = cleanSearchTitle(m.title);
      if (cleaned && cleaned.length >= 3 && !candidateTitles.includes(cleaned)) {
        candidateTitles.push(cleaned);
      }
      if (candidateTitles.length >= 3) break;
    }
    for (const fallbackTitle of LATEST_SEED_TITLES) {
      if (!candidateTitles.includes(fallbackTitle) && candidateTitles.length < 4) {
        candidateTitles.push(fallbackTitle);
      }
    }

    const batches = await Promise.allSettled(
      candidateTitles.map((title) =>
        searchOfficialSubtitles({ query: title, lang, limit: 4 })
      )
    );

    const combined = [];
    const seenIds = new Set();
    for (const batch of batches) {
      if (batch.status !== 'fulfilled') continue;
      for (const item of batch.value) {
        if (seenIds.has(item.id)) continue;
        seenIds.add(item.id);
        combined.push(attachMatchedMovie(item));
      }
    }

    combined.sort((a, b) => {
      const dateDiff = String(b.addedAt || '').localeCompare(String(a.addedAt || ''));
      if (dateDiff !== 0) return dateDiff;
      return b.downloadsCount - a.downloadsCount;
    });

    return res.status(200).json({
      mode: 'latest',
      query: '',
      lang,
      items: combined.slice(0, 20),
      catalogQuickPicks: catalog.slice(0, 6).map((m) => ({
        id: m.id,
        title: m.title,
        searchHint: cleanSearchTitle(m.title) || m.title,
        year: m.year,
      })),
    });
  } catch (err) {
    console.error('[Official Subtitles Search API] Error:', err?.message || err);
    return res.status(502).json({
      error: err?.message || 'Could not reach official subtitle directory right now.',
      items: [],
    });
  }
}
