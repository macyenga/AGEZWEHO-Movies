import { createClient } from '@supabase/supabase-js';
import { createMockSupabaseClient } from '../memory-store';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let client;
const isValidHttpUrl = (str) => {
  try {
    const u = new URL(str);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
};

if (supabaseUrl && supabaseServiceKey && isValidHttpUrl(supabaseUrl)) {
  try {
    client = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  } catch (err) {
    console.warn('[AI Studio] Supabase admin client init failed, falling back to mock:', err?.message);
    client = createMockSupabaseClient();
  }
} else {
  client = createMockSupabaseClient();
}

export const supabaseAdmin = client;
