import { supabaseAdmin } from '../../../lib/server/supabase-admin';

const OMDB_API_KEY = process.env.OMDB_API_KEY;

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { q, id } = req.query;
  if (!q && !id) return res.status(400).json({ error: 'Query (q) or IMDB ID (id) required' });

  if (!OMDB_API_KEY) return res.status(500).json({ error: 'OMDB API key not configured' });

  const endpoint = id
    ? `https://www.omdbapi.com/?i=${encodeURIComponent(id)}&apikey=${OMDB_API_KEY}`
    : `https://www.omdbapi.com/?s=${encodeURIComponent(q)}&apikey=${OMDB_API_KEY}`;

  const response = await fetch(endpoint);
  const data = await response.json();

  return res.status(200).json(data);
}
