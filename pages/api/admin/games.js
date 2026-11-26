import { supabaseAdmin } from '../../../lib/server/supabase-admin';
import { requireAdmin } from '../../../lib/server/admin-auth';
import { isValidRwandaPhone, normalizeRwandaPhone } from '../../../lib/paypack-client';
import {
  normalizeContentType,
  normalizePremiumLinks,
  sanitizeHttpUrl,
} from '../../../lib/premium-content';

const ALLOWED_FIELDS = [
  'title',
  'type',
  'category',
  'version',
  'rating',
  'cover_url',
  'video_url',
  'overview',
  'links',
  'premium',
  'price',
  'uploader_momo_number',
  'status',
];

function pickGameUpdates(body) {
  return Object.fromEntries(
    Object.entries(body || {}).filter(([key]) => ALLOWED_FIELDS.includes(key))
  );
}

function validateAndSanitizePayload(payload) {
  const clean = { ...payload };

  if (clean.cover_url !== undefined) {
    const raw = String(clean.cover_url || '').trim();
    if (!raw) {
      clean.cover_url = null;
    } else {
      const safe = sanitizeHttpUrl(raw);
      if (!safe) return { error: 'Cover URL must start with http:// or https://' };
      clean.cover_url = safe;
    }
  }

  if (clean.video_url !== undefined) {
    const raw = String(clean.video_url || '').trim();
    if (!raw) {
      clean.video_url = null;
    } else {
      const safe = sanitizeHttpUrl(raw);
      if (!safe) return { error: 'Video URL must start with http:// or https://' };
      clean.video_url = safe;
    }
  }

  if (clean.links !== undefined) {
    const rawLinks = Array.isArray(clean.links) ? clean.links : [];
    for (const item of rawLinks) {
      const candidate = typeof item === 'string' ? item.trim() : String(item?.url || '').trim();
      if (candidate && !sanitizeHttpUrl(candidate)) {
        return { error: 'All download/resource links must start with http:// or https://' };
      }
    }
    clean.links = normalizePremiumLinks(rawLinks);
  }

  if (clean.uploader_momo_number !== undefined) {
    const rawMomo = String(clean.uploader_momo_number || '').trim();
    if (!rawMomo) {
      clean.uploader_momo_number = null;
    } else {
      const normalized = normalizeRwandaPhone(rawMomo);
      if (!isValidRwandaPhone(normalized)) {
        return { error: 'Invalid Rwandan MoMo number (e.g. 0788123456)' };
      }
      clean.uploader_momo_number = normalized;
    }
  }

  if (clean.type !== undefined) {
    clean.type = normalizeContentType(clean.type, Boolean(clean.video_url));
  }

  return { data: clean };
}

export default async function handler(req, res) {
  if (!(await requireAdmin(req, res))) return;

  if (req.method === 'POST') {
    const rawPayload = pickGameUpdates(req.body);
    if (!rawPayload.title || !String(rawPayload.title).trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const { data: payload, error: valError } = validateAndSanitizePayload(rawPayload);
    if (valError) return res.status(400).json({ error: valError });

    const isPremium = payload.premium !== false;
    const parsedPrice = isPremium ? Math.max(0, parseInt(payload.price || 500, 10) || 0) : 0;

    const { data, error } = await supabaseAdmin
      .from('games')
      .insert([
        {
          type: normalizeContentType(payload.type, Boolean(payload.video_url)),
          category: 'Entertainment',
          rating: '4.8',
          links: [],
          ...payload,
          title: String(payload.title).trim(),
          premium: isPremium,
          price: parsedPrice,
          status: payload.status || 'approved',
        },
      ])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ game: data });
  }

  if (req.method === 'PATCH') {
    const { id, ...body } = req.body || {};
    if (!id) return res.status(400).json({ error: 'Game ID required' });

    const rawUpdates = pickGameUpdates(body);
    const { data: updates, error: valError } = validateAndSanitizePayload(rawUpdates);
    if (valError) return res.status(400).json({ error: valError });

    if (updates.price !== undefined) {
      updates.price = Math.max(0, parseInt(updates.price, 10) || 0);
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid updates provided' });
    }

    const { data, error } = await supabaseAdmin
      .from('games')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ game: data });
  }

  if (req.method === 'DELETE') {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: 'Game ID required' });

    const { error } = await supabaseAdmin.from('games').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
