import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase env vars. Copy .env.local.example to .env.local and fill in your keys.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ── Movies ──────────────────────────────────────────────
export async function getMovies() {
  const { data, error } = await supabase.from('movies').select('*').eq('status', 'approved').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getMovieById(id) {
  const { data, error } = await supabase.from('movies').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function addMovie(movie) {
  const { error } = await supabase.from('movies').insert([{ ...movie, status: 'pending' }]);
  if (error) throw error;
}

// ── Requests ────────────────────────────────────────────
export async function getRequests() {
  const { data, error } = await supabase.from('requests').select('*').order('votes', { ascending: false }).order('donation_total', { ascending: false }).order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function addRequest(req) {
  const { data, error } = await supabase.from('requests').insert([req]).select().single();
  if (error) throw error;
  return data;
}

export async function submitContact(data) {
  const { error } = await supabase.from('contacts').insert([data]);
  if (error) throw error;
}

// ── Games ───────────────────────────────────────────────
export async function getGameById(id) {
  const { data, error } = await supabase.from('games').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}
