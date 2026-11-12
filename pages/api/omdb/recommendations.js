// /pages/api/omdb/recommendations.js
const OMDB_API_KEY = process.env.OMDB_API_KEY;

// High-quality genre seed queries for OMDB search
const GENRE_SEARCH_MAP = {
  Action: ['John Wick', 'Avengers', 'Gladiator', 'Mission Impossible', 'Mad Max'],
  Drama: ['Oppenheimer', 'Godfather', 'Parasite', 'Whiplash', 'Shawshank'],
  Comedy: ['Deadpool', 'Barbie', 'Superbad', 'Hangover', 'Grand Budapest'],
  Thriller: ['Inception', 'Joker', 'Se7en', 'Shutter Island', 'Zodiac'],
  Horror: ['Conjuring', 'A Quiet Place', 'Hereditary', 'Alien', 'Get Out'],
  Romance: ['La La Land', 'Titanic', 'Notebook', 'Past Lives'],
  'Sci-Fi': ['Interstellar', 'Dune', 'Matrix', 'Blade Runner', 'Avatar'],
  Fantasy: ['Lord of the Rings', 'Harry Potter', 'Hobbit', 'Pan Labyrinth'],
  Animation: ['Spider-Verse', 'Spirited Away', 'Inside Out', 'Lion King', 'Coco'],
  Adventure: ['Indiana Jones', 'Pirates of Caribbean', 'Jumanji', 'Uncharted'],
  Crime: ['Dark Knight', 'Scarface', 'Goodfellas', 'Heat', 'Departed'],
  Mystery: ['Knives Out', 'Sherlock Holmes', 'Memento', 'Prisoners'],
};

// Curated fallback movie library organized by genre when OMDB API key is unset or offline
const CURATED_GENRE_MOVIES = {
  Action: [
    {
      imdbID: 'tt10366206',
      title: 'John Wick: Chapter 4',
      year: '2023',
      genre: 'Action, Crime, Thriller',
      rating: '7.7',
      poster_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80',
      overview: 'John Wick uncovers a path to defeating The High Table, but before he can earn his freedom, he must face a new enemy.',
    },
    {
      imdbID: 'tt9362722',
      title: 'Spider-Man: Across the Spider-Verse',
      year: '2023',
      genre: 'Action, Animation, Adventure',
      rating: '8.6',
      poster_url: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=500&auto=format&fit=crop&q=80',
      overview: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.',
    },
    {
      imdbID: 'tt0468569',
      title: 'The Dark Knight',
      year: '2008',
      genre: 'Action, Crime, Drama',
      rating: '9.0',
      poster_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80',
      overview: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    },
  ],
  Drama: [
    {
      imdbID: 'tt15398776',
      title: 'Oppenheimer',
      year: '2023',
      genre: 'Biography, Drama, History',
      rating: '8.9',
      poster_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&auto=format&fit=crop&q=80',
      overview: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.',
    },
    {
      imdbID: 'tt0111161',
      title: 'The Shawshank Redemption',
      year: '1994',
      genre: 'Drama',
      rating: '9.3',
      poster_url: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=500&auto=format&fit=crop&q=80',
      overview: 'Over the course of several years, two convicts form a friendship, seeking consolation and, eventually, redemption through basic compassion.',
    },
  ],
  Thriller: [
    {
      imdbID: 'tt1375666',
      title: 'Inception',
      year: '2010',
      genre: 'Action, Adventure, Sci-Fi, Thriller',
      rating: '8.8',
      poster_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80',
      overview: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    },
    {
      imdbID: 'tt7286456',
      title: 'Joker',
      year: '2019',
      genre: 'Crime, Drama, Thriller',
      rating: '8.4',
      poster_url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=500&auto=format&fit=crop&q=80',
      overview: 'During the 1980s, a failed stand-up comedian is driven insane and turns to a life of crime and chaos in Gotham City while becoming an infamous psychopathic crime figure.',
    },
  ],
  'Sci-Fi': [
    {
      imdbID: 'tt0816692',
      title: 'Interstellar',
      year: '2014',
      genre: 'Adventure, Drama, Sci-Fi',
      rating: '8.7',
      poster_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=80',
      overview: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
    },
    {
      imdbID: 'tt1160419',
      title: 'Dune: Part One',
      year: '2021',
      genre: 'Action, Adventure, Drama, Sci-Fi',
      rating: '8.0',
      poster_url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=500&auto=format&fit=crop&q=80',
      overview: 'A noble family becomes embroiled in a war for control over the galaxy most valuable asset while its heir becomes troubled by visions of a dark future.',
    },
  ],
  Comedy: [
    {
      imdbID: 'tt6263850',
      title: 'Deadpool & Wolverine',
      year: '2024',
      genre: 'Action, Comedy, Sci-Fi',
      rating: '7.8',
      poster_url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=500&auto=format&fit=crop&q=80',
      overview: 'Wolverine is recovering from his injuries when he crosses paths with the loudmouth, Deadpool. They team up to defeat a common enemy.',
    },
  ],
  Horror: [
    {
      imdbID: 'tt1457767',
      title: 'The Conjuring',
      year: '2013',
      genre: 'Horror, Mystery, Thriller',
      rating: '7.5',
      poster_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80',
      overview: 'Paranormal investigators Ed and Lorraine Warren work to help a family terrorized by a dark presence in their farmhouse.',
    },
  ],
  Anime: [
    {
      imdbID: 'tt0245429',
      title: 'Spirited Away',
      year: '2001',
      genre: 'Animation, Adventure, Family, Fantasy',
      rating: '8.6',
      poster_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80',
      overview: 'During her family move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches and spirits, and where humans are changed into beasts.',
    },
  ],
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { genres = 'Action,Drama', limit = '10' } = req.query;
  const requestedGenres = genres
    .split(',')
    .map(g => g.trim())
    .filter(Boolean);

  const activeGenres = requestedGenres.length > 0 ? requestedGenres : ['Action', 'Thriller'];
  const maxResults = Math.min(Math.max(parseInt(limit, 10) || 10, 4), 20);

  // If OMDB_API_KEY is configured, try querying OMDB for fresh data
  if (OMDB_API_KEY) {
    try {
      const recommendations = [];
      const seenTitles = new Set();

      // Sample queries based on requested genres
      const queriesToRun = [];
      for (const genre of activeGenres) {
        const queryList = GENRE_SEARCH_MAP[genre] || [genre];
        // Pick 1-2 search terms for this genre
        for (const term of queryList.slice(0, 2)) {
          queriesToRun.push({ genre, term });
        }
      }

      for (const { genre, term } of queriesToRun) {
        if (recommendations.length >= maxResults) break;
        try {
          const omdbRes = await fetch(
            `https://www.omdbapi.com/?s=${encodeURIComponent(term)}&type=movie&apikey=${OMDB_API_KEY}`
          );
          if (omdbRes.ok) {
            const data = await omdbRes.json();
            if (data.Search && Array.isArray(data.Search)) {
              for (const item of data.Search) {
                if (!seenTitles.has(item.Title.toLowerCase())) {
                  seenTitles.add(item.Title.toLowerCase());
                  recommendations.push({
                    id: item.imdbID,
                    imdbID: item.imdbID,
                    title: item.Title,
                    year: item.Year,
                    type: item.Type || 'movie',
                    genre,
                    matchedGenre: genre,
                    poster_url:
                      item.Poster && item.Poster !== 'N/A'
                        ? item.Poster
                        : 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&auto=format&fit=crop&q=80',
                    overview: `Similar ${genre} title discovered on OMDB. Watch or request Agasobanuye translation on Agezweho.`,
                    rating: '7.8',
                    source: 'omdb',
                  });
                }
                if (recommendations.length >= maxResults) break;
              }
            }
          }
        } catch (fetchErr) {
          console.warn(`[OMDB] Error querying "${term}":`, fetchErr?.message);
        }
      }

      if (recommendations.length > 0) {
        return res.status(200).json({
          source: 'omdb',
          genres: activeGenres,
          recommendations,
        });
      }
    } catch (err) {
      console.warn('[OMDB] Failed to fetch recommendations from API:', err?.message);
    }
  }

  // Graceful fallback: Curated recommendations matching the user's recently viewed genres
  const results = [];
  const seen = new Set();

  for (const genre of activeGenres) {
    const list = CURATED_GENRE_MOVIES[genre] || CURATED_GENRE_MOVIES['Action'] || [];
    for (const item of list) {
      if (!seen.has(item.title.toLowerCase())) {
        seen.add(item.title.toLowerCase());
        results.push({
          ...item,
          id: item.imdbID,
          matchedGenre: genre,
          source: 'catalog',
        });
      }
    }
  }

  // If still fewer than 4, fill in from general action/thriller catalogue
  if (results.length < 4) {
    const allFallback = [
      ...CURATED_GENRE_MOVIES.Action,
      ...CURATED_GENRE_MOVIES.Thriller,
      ...CURATED_GENRE_MOVIES.Drama,
    ];
    for (const item of allFallback) {
      if (!seen.has(item.title.toLowerCase())) {
        seen.add(item.title.toLowerCase());
        results.push({
          ...item,
          id: item.imdbID,
          matchedGenre: activeGenres[0] || 'Action',
          source: 'catalog',
        });
      }
      if (results.length >= maxResults) break;
    }
  }

  return res.status(200).json({
    source: 'catalog',
    genres: activeGenres,
    recommendations: results.slice(0, maxResults),
  });
}
