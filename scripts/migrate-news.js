const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
  process.exit(1);
}

const PROJECT_REF = SUPABASE_URL.replace('https://', '').split('.')[0];

const sql = `
create table if not exists news (
  id              uuid default gen_random_uuid() primary key,
  title           text not null,
  content         text,
  image_url       text,
  category        text default 'Amakuru',
  author_name     text default 'Anonymous',
  author_id       uuid references auth.users(id) on delete set null,
  publisher_momo  text,
  status          text default 'pending',
  likes           integer default 0,
  comments_count  integer default 0,
  created_at      timestamptz default now()
);

alter table news enable row level security;

drop policy if exists "public_read_news" on news;
create policy "public_read_news" on news for select using (status = 'approved' or auth.role() = 'service_role');

drop policy if exists "service_all_news" on news;
create policy "service_all_news" on news for all using (auth.role() = 'service_role');

create index if not exists news_status_created_idx on news (status, created_at desc);
create index if not exists news_category_idx on news (category);

create or replace function increment_news_likes(row_id uuid)
returns integer language plpgsql security definer as $$
begin
  update news set likes = likes + 1 where id = row_id;
  return (select likes from news where id = row_id);
end;
$$;
`;

async function run() {
  console.log('News table migration — Pro News & Tips\n');

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const statements = sql
    .replace(/^--.*$/gm, '')
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  let ok = 0, err = 0;
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i] + ';';
    const preview = stmt.replace(/\s+/g, ' ').substring(0, 70);
    try {
      const { error } = await supabase.rpc('exec_sql', { query: stmt });
      if (error) throw error;
      console.log(`  ✓ [${i+1}/${statements.length}] ${preview}`);
      ok++;
    } catch (e) {
      if (e.message?.toLowerCase().includes('already exists') || e.message?.toLowerCase().includes('duplicate')) {
        console.log(`  ✓ [${i+1}/${statements.length}] ${preview} (exists)`);
        ok++;
      } else {
        console.log(`  ✗ [${i+1}/${statements.length}] ${preview}`);
        console.log(`    ${e.message?.substring(0, 120)}`);
        err++;
      }
    }
  }

  console.log(`\n${ok} ok, ${err} failed`);
  if (err === 0) {
    console.log('\n✅ News migration completed!');
    return;
  }

  console.log('\n⚠️  Auto-migration failed. Paste this SQL in your Supabase SQL Editor:');
  console.log(`https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new\n`);
  console.log(sql);
}

run().catch(console.error);
