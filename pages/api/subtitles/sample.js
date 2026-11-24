const SAMPLE_TRACKS = {
  rw: [
    'WEBVTT',
    '',
    '00:00:00.500 --> 00:00:04.500',
    'Murakaza neza kuri Agasobanuye.rw — Reba unamanure firime zisobanuwe mu Kinyarwanda.',
    '',
    '00:00:05.000 --> 00:00:09.500',
    'Iyi preview irerekana uburyo amagambo (Subtitles) agaragara igihe ureba firime.',
    '',
    '00:00:10.000 --> 00:00:15.000',
    'Kanda ahanditse Load .SRT / .VTT niba ushaka gushyiraho subtitle yawebwite.',
  ],
  en: [
    'WEBVTT',
    '',
    '00:00:00.500 --> 00:00:04.500',
    'Welcome to Agasobanuye.rw — Stream and download Agasobanuye releases in Rwanda.',
    '',
    '00:00:05.000 --> 00:00:09.500',
    'This preview demonstrates synchronized WebVTT and SRT subtitles.',
    '',
    '00:00:10.000 --> 00:00:15.000',
    'You can also upload your own local .srt or .vtt file directly in the player.',
  ],
};

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const lang = req.query.lang === 'en' ? 'en' : 'rw';
  const titleParam = typeof req.query.title === 'string' ? req.query.title.trim() : '';
  const lines = [...(SAMPLE_TRACKS[lang] || SAMPLE_TRACKS.rw)];

  if (titleParam) {
    lines[3] =
      lang === 'en'
        ? `Now previewing: ${titleParam} on Agasobanuye.rw.`
        : `Ubu uri kureba: ${titleParam} kuri Agasobanuye.rw.`;
  }

  res.setHeader('Content-Type', 'text/vtt; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=300');
  return res.status(200).send(lines.join('\n'));
}
