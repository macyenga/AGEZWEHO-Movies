import { fetchOfficialSubtitleContent } from '../../../lib/server/official-subtitles';
import {
  formatCuesToSrt,
  formatCuesToVtt,
  sanitizeSubtitleFilename,
} from '../../../lib/subtitles';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const rawUrl = typeof req.query.url === 'string' ? req.query.url.trim() : '';
  const requestedName = typeof req.query.filename === 'string' ? req.query.filename.trim() : 'official_subtitle';
  const format = typeof req.query.format === 'string' ? req.query.format.trim().toLowerCase() : 'srt';

  if (!rawUrl) {
    return res.status(400).json({ error: 'Missing subtitle download url parameter' });
  }

  try {
    const { rawText, cues } = await fetchOfficialSubtitleContent(rawUrl);

    if (format === 'json') {
      return res.status(200).json({
        filename: sanitizeSubtitleFilename(requestedName, 'srt'),
        cueCount: cues.length,
        cues,
        srt: cues.length > 0 ? formatCuesToSrt(cues) : rawText,
        vtt: formatCuesToVtt(cues),
      });
    }

    if (format === 'vtt') {
      const safeName = sanitizeSubtitleFilename(requestedName, 'vtt');
      res.setHeader('Content-Type', 'text/vtt; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
      return res.status(200).send(formatCuesToVtt(cues));
    }

    const safeName = sanitizeSubtitleFilename(requestedName, 'srt');
    res.setHeader('Content-Type', 'application/x-subrip; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
    return res.status(200).send(cues.length > 0 ? formatCuesToSrt(cues) : rawText);
  } catch (err) {
    const status = Number.isInteger(err?.statusCode) ? err.statusCode : 502;
    return res.status(status).json({ error: err?.message || 'Failed to fetch official subtitle' });
  }
}
