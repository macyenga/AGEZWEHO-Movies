const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
  process.exit(1);
}

const PROJECT_REF = SUPABASE_URL.replace('https://', '').split('.')[0];

const sql = `
create table if not exists shop (
  id              uuid default gen_random_uuid() primary key,
  title           text not null,
  description     text,
  price           text,
  image_url       text,
  category        text default 'Other',
  seller_name     text default 'Anonymous',
  seller_whatsapp text not null,
  status          text default 'active',
  created_at      timestamptz default now()
);

alter table shop enable row level security;

drop policy if exists "public_read_shop" on shop;
create policy "public_read_shop" on shop for select using (status = 'active' or auth.role() = 'service_role');

drop policy if exists "service_all_shop" on shop;
create policy "service_all_shop" on shop for all using (auth.role() = 'service_role');

create index if not exists shop_status_created_idx on shop (status, created_at desc);
create index if not exists shop_category_idx on shop (category);
`;

async function run() {
  console.log('Shop table migration — WhatsApp Marketplace\n');

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
      console.log(`  \u2713 [${i+1}/${statements.length}] ${preview}`);
      ok++;
    } catch (e) {
      if (e.message?.toLowerCase().includes('already exists') || e.message?.toLowerCase().includes('duplicate')) {
        console.log(`  \u2713 [${i+1}/${statements.length}] ${preview} (exists)`);
        ok++;
      } else {
        console.log(`  \u2717 [${i+1}/${statements.length}] ${preview}`);
        console.log(`    ${e.message?.substring(0, 120)}`);
        err++;
      }
    }
  }

  console.log(`\n${ok} ok, ${err} failed`);
  if (err === 0) {
    console.log('\n\u2705 Shop migration completed!');
    return;
  }

  console.log('\n\u26a0\ufe0f  Auto-migration failed. Paste this SQL in your Supabase SQL Editor:');
  console.log(`https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new\n`);
  console.log(sql);
}

run().catch(console.error);
