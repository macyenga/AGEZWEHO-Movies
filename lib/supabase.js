import { createClient } from '@supabase/supabase-js';
import { createMockSupabaseClient } from './memory-store';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client;
const isValidHttpUrl = (str) => {
  try {
    const u = new URL(str);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
};

if (supabaseUrl && supabaseAnonKey && isValidHttpUrl(supabaseUrl)) {
  try {
    client = createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.warn('[AI Studio] Supabase client init failed, falling back to mock:', err?.message);
    client = createMockSupabaseClient();
  }
} else {
  client = createMockSupabaseClient();
}

export const supabase = client;

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

// ── News ────────────────────────────────────────────────
export async function getNews() {
  const { data, error } = await supabase.from('news').select('*').eq('status', 'approved').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function addNews(item) {
  const { data, error } = await supabase.from('news').insert([item]).select().single();
  if (error) throw error;
  return data;
}
