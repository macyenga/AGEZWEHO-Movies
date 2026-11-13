export const UPCOMING_MOVIES = [
  {
    id: 'upcoming-kgf-chapter-3-agasobanuye',
    title: 'KGF Chapter 3 (Agasobanuye)',
    releaseDate: '2026-11-28',
    type: 'Movie',
    genre: 'Action',
    language: 'Kinyarwanda',
    interpreter: 'Rocky Kimomo',
    poster_url: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=500&auto=format&fit=crop&q=80',
    trailer_url: 'https://www.youtube.com/watch?v=g3JUbgOHgdw',
    overview: 'Rocky Bhai returns in the most anticipated Agasobanuye action chapter, translated by Rocky Kimomo.',
  },
  {
    id: 'upcoming-sankara-shadow-protocol',
    title: 'Shadow Protocol 2026',
    releaseDate: '2026-12-06',
    type: 'Movie',
    genre: 'Thriller',
    language: 'Kinyarwanda',
    interpreter: 'Sankara HD',
    poster_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80',
    trailer_url: 'https://www.youtube.com/watch?v=8FkLRUJj-o0',
    overview: 'A rogue intelligence operative uncovers a cross-border conspiracy in Kigali and Nairobi.',
  },
  {
    id: 'upcoming-panchayat-season-4',
    title: 'Panchayat Season 4',
    releaseDate: '2026-12-19',
    type: 'Series',
    genre: 'Comedy',
    language: 'Hindi / Kinyarwanda',
    interpreter: 'Junior Giti',
    poster_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&auto=format&fit=crop&q=80',
    trailer_url: 'https://www.youtube.com/watch?v=33o3s4Vs4Sw',
    overview: 'Phulera faces its biggest election showdown yet with new twists, warmth, and village humor.',
  },
  {
    id: 'upcoming-solo-leveling-reawakening',
    title: 'Solo Leveling: Jeju Island Arc',
    releaseDate: '2027-01-09',
    type: 'Anime',
    genre: 'Fantasy',
    language: 'Japanese / Sub',
    interpreter: 'AnimeRwanda',
    poster_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80',
    trailer_url: 'https://www.youtube.com/watch?v=eqy85AL70PU',
    overview: 'S-Rank hunters unite for the decisive raid on Jeju Island as Sung Jinwoo unleashes his shadow army.',
  },
  {
    id: 'upcoming-kigali-nights-drama',
    title: 'Amajoro y i Kigali',
    releaseDate: '2027-01-24',
    type: 'Movie',
    genre: 'Drama',
    language: 'Kinyarwanda',
    interpreter: 'Fey Movies',
    poster_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80',
    trailer_url: 'https://www.youtube.com/watch?v=KVnheXywIbY',
    overview: 'An emotional Rwandan original drama following two siblings chasing music and hope in Kigali.',
  },
  {
    id: 'upcoming-virunga-chronicles',
    title: 'Virunga: Guardians of the Mist',
    releaseDate: '2027-02-14',
    type: 'Documentary',
    genre: 'Adventure',
    language: 'English / Kinyarwanda',
    interpreter: 'Kigali Discovery',
    poster_url: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=500&auto=format&fit=crop&q=80',
    trailer_url: 'https://www.youtube.com/watch?v=XzWjio_RuNE',
    overview: 'A 4K conservation feature celebrating Rwandan park rangers and mountain gorilla families.',
  },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatReleaseDate(isoDate) {
  if (!isoDate || typeof isoDate !== 'string') return 'TBA';
  const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return isoDate;
  const year = Number(match[1]);
  const monthIdx = Number(match[2]) - 1;
  const day = Number(match[3]);
  if (monthIdx < 0 || monthIdx > 11 || day < 1 || day > 31) return isoDate;
  return `${MONTHS[monthIdx]} ${day}, ${year}`;
}

export function getDaysUntilRelease(isoDate, referenceDate = new Date()) {
  if (!isoDate || typeof isoDate !== 'string') return null;
  const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const targetUtc = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  const refUtc = Date.UTC(
    referenceDate.getUTCFullYear(),
    referenceDate.getUTCMonth(),
    referenceDate.getUTCDate()
  );
  const diffDays = Math.round((targetUtc - refUtc) / 86400000);
  return Math.max(0, diffDays);
}

export function getCountdownLabel(isoDate, referenceDate = new Date()) {
  const days = getDaysUntilRelease(isoDate, referenceDate);
  if (days === null) return 'Coming Soon';
  if (days === 0) return 'Releasing Today';
  if (days === 1) return 'Tomorrow';
  return `In ${days} days`;
}

export function getUpcomingMovies(items = UPCOMING_MOVIES, referenceDate = new Date()) {
  if (!Array.isArray(items)) return [];
  return [...items]
    .sort((a, b) => String(a.releaseDate || '').localeCompare(String(b.releaseDate || '')))
    .map((movie) => ({
      ...movie,
      formattedReleaseDate: formatReleaseDate(movie.releaseDate),
      daysUntilRelease: getDaysUntilRelease(movie.releaseDate, referenceDate),
      countdownLabel: getCountdownLabel(movie.releaseDate, referenceDate),
    }));
}
