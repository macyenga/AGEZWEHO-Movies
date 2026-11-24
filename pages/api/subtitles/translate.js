import { translateCuesToKinyarwanda } from '../../../lib/server/subtitle-translator';
import {
  formatCuesToSrt,
  formatCuesToVtt,
  parseSubtitleCues,
} from '../../../lib/subtitles';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    cues: inputCues,
    rawText,
    movieTitle = '',
    sourceLanguage = 'English',
  } = req.body || {};

  try {
    let cuesToTranslate = Array.isArray(inputCues) ? inputCues : [];
    if (cuesToTranslate.length === 0 && typeof rawText === 'string' && rawText.trim()) {
      cuesToTranslate = parseSubtitleCues(rawText).slice(0, 100);
    }

    if (cuesToTranslate.length === 0) {
      return res.status(400).json({ error: 'Provide subtitle cues or raw .SRT/.VTT text to translate.' });
    }

    const result = await translateCuesToKinyarwanda({
      cues: cuesToTranslate,
      movieTitle: String(movieTitle || '').slice(0, 140),
      sourceLanguage: String(sourceLanguage || 'English').slice(0, 40),
    });

    return res.status(200).json({
      cues: result.cues,
      model: result.model,
      translatedCount: result.translatedCount,
      srt: formatCuesToSrt(result.cues, { useTranslated: true }),
      vtt: formatCuesToVtt(result.cues, { useTranslated: true }),
    });
  } catch (err) {
    const status = Number.isInteger(err?.statusCode) ? err.statusCode : 500;
    return res.status(status).json({
      error: err?.message || 'Kinyarwanda translation failed.',
    });
  }
}
