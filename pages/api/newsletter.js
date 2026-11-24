import { supabaseAdmin } from '../../lib/server/supabase-admin';
import { validateNewsletterPayload } from '../../lib/newsletter';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const validation = validateNewsletterPayload(req.body);
  if (!validation.ok) {
    return res.status(400).json({
      error: validation.error,
      code: validation.code,
    });
  }

  const { email, source, language } = validation;

  try {
    const { data: existing, error: lookupError } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('id, email, status')
      .eq('email', email)
      .maybeSingle();

    if (lookupError) {
      throw lookupError;
    }

    if (existing) {
      return res.status(200).json({
        ok: true,
        alreadySubscribed: true,
        email,
      });
    }

    const { data: created, error: insertError } = await supabaseAdmin
      .from('newsletter_subscribers')
      .insert([
        {
          email,
          source,
          language,
          status: 'active',
        },
      ])
      .select('id, email, created_at')
      .single();

    if (insertError) {
      if (insertError.code === '23505') {
        return res.status(200).json({
          ok: true,
          alreadySubscribed: true,
          email,
        });
      }
      throw insertError;
    }

    return res.status(201).json({
      ok: true,
      alreadySubscribed: false,
      email: created?.email || email,
      createdAt: created?.created_at || new Date().toISOString(),
    });
  } catch (err) {
    console.error('[Newsletter API] Supabase error:', err?.message || err);
    return res.status(500).json({
      error: 'Unable to complete your subscription right now. Please try again shortly.',
    });
  }
}
