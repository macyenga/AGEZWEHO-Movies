import { supabaseAdmin } from '../../../lib/server/supabase-admin';
import { isValidRwandaPhone, normalizeRwandaPhone } from '../../../lib/paypack-client';
import { getRequestUser } from '../../../lib/server/premium-access';
import {
  normalizeContentType,
  normalizePremiumLinks,
  sanitizeHttpUrl,
} from '../../../lib/premium-content';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      title,
      type,
      category,
      version,
      rating,
      cover_url,
      video_url,
      overview,
      premium,
      price,
      uploader_momo_number,
      links,
    } = req.body || {};

    if (!title?.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (!category) {
      return res.status(400).json({ error: 'Category is required' });
    }

    const rawCover = typeof cover_url === 'string' ? cover_url.trim() : '';
    const safeCoverUrl = rawCover ? sanitizeHttpUrl(rawCover) : null;
    if (rawCover && !safeCoverUrl) {
      return res.status(400).json({ error: 'Cover image URL must start with http:// or https://' });
    }

    const rawVideo = typeof video_url === 'string' ? video_url.trim() : '';
    const safeVideoUrl = rawVideo ? sanitizeHttpUrl(rawVideo) : null;
    if (rawVideo && !safeVideoUrl) {
      return res.status(400).json({ error: 'Private video URL must start with http:// or https://' });
    }

    const rawLinks = Array.isArray(links) ? links : [];
    for (const item of rawLinks) {
      const candidate = typeof item === 'string' ? item.trim() : String(item?.url || '').trim();
      if (candidate && !sanitizeHttpUrl(candidate)) {
        return res.status(400).json({ error: 'Every download/resource link must start with http:// or https://' });
      }
    }
    const normalizedLinks = normalizePremiumLinks(rawLinks);

    if (!safeVideoUrl && normalizedLinks.length === 0) {
      return res.status(400).json({
        error: 'Please provide at least a Private Video URL or a valid Download/Resource Link.',
      });
    }

    const rawMomo = typeof uploader_momo_number === 'string' ? uploader_momo_number.trim() : '';
    let normalizedMomo = null;
    if (rawMomo) {
      normalizedMomo = normalizeRwandaPhone(rawMomo);
      if (!isValidRwandaPhone(normalizedMomo)) {
        return res.status(400).json({ error: 'Invalid Rwandan MoMo number (e.g. 0788123456)' });
      }
    }

    const isPremium = premium !== false;
    const parsedPrice = isPremium ? Math.max(50, parseInt(price, 10) || 50) : 0;
    const contentType = normalizeContentType(type, Boolean(safeVideoUrl));
    const user = await getRequestUser(req);

    const { data: inserted, error } = await supabaseAdmin
      .from('games')
      .insert([
        {
          title: title.trim().slice(0, 120),
          type: contentType,
          category: String(category).trim().slice(0, 80),
          version: version ? String(version).trim().slice(0, 32) : null,
          rating: rating ? String(rating).trim().slice(0, 16) : null,
          cover_url: safeCoverUrl,
          video_url: safeVideoUrl,
          overview: overview ? String(overview).trim().slice(0, 800) : null,
          premium: isPremium,
          price: parsedPrice,
          uploader_momo_number: normalizedMomo,
          uploader_id: user?.id || null,
          uploader_email: user?.email || null,
          uploader_earnings: 0,
          links: normalizedLinks,
          status: 'pending',
          created_at: new Date().toISOString(),
        },
      ])
      .select('id, status')
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true, id: inserted?.id || null });
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
