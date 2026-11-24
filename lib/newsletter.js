const EMAIL_REGEX = /^[^\s@<>()[\]\\,;:\s@"]+@[^\s@<>()[\]\\,;:\s@"]+\.[^\s@<>()[\]\\,;:\s@"]{2,}$/;

export function normalizeNewsletterEmail(email) {
  if (typeof email !== 'string') return '';
  return email.trim().toLowerCase();
}

export function isValidNewsletterEmail(email) {
  const normalized = normalizeNewsletterEmail(email);
  if (!normalized || normalized.length > 254) return false;
  if (/[\r\n\0]/.test(normalized)) return false;
  return EMAIL_REGEX.test(normalized);
}

export function sanitizeNewsletterSource(source) {
  if (typeof source !== 'string') return 'homepage';
  const cleaned = source.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
  return cleaned ? cleaned.slice(0, 40) : 'homepage';
}

export function validateNewsletterPayload(payload = {}) {
  const rawEmail = payload && typeof payload === 'object' ? payload.email : '';
  const normalizedEmail = normalizeNewsletterEmail(rawEmail);

  if (!normalizedEmail) {
    return {
      ok: false,
      code: 'EMAIL_REQUIRED',
      error: 'Please enter your email address.',
    };
  }

  if (!isValidNewsletterEmail(normalizedEmail)) {
    return {
      ok: false,
      code: 'EMAIL_INVALID',
      error: 'Please enter a valid email address.',
    };
  }

  const rawLanguage = payload && typeof payload === 'object' ? payload.language : 'en';
  const language = rawLanguage === 'rw' ? 'rw' : 'en';
  const source = sanitizeNewsletterSource(payload && typeof payload === 'object' ? payload.source : undefined);

  return {
    ok: true,
    email: normalizedEmail,
    source,
    language,
  };
}
