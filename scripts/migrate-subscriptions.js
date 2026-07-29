const { Client } = require('pg');

const projectRef = 'rsfdrqhcxuypoqhymxwr';
const password = process.env.SUPABASE_SERVICE_ROLE_KEY;

const sql = `
create table if not exists subscriptions (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references auth.users(id) on delete cascade not null,
  plan_type     text default 'pro',
  status        text default 'pending',
  phone         text,
  payment_method text,
  amount        integer not null,
  months        integer default 1,
  expires_at    timestamptz,
  approved_by   uuid references auth.users(id) on delete set null,
  approved_at   timestamptz,
  created_at    timestamptz default now()
);

create index if not exists subscriptions_user_id_idx on subscriptions (user_id);
create index if not exists subscriptions_status_idx on subscriptions (status);

alter table subscriptions enable row level security;

drop policy if exists "auth_read_subscriptions" on subscriptions;
create policy "auth_read_subscriptions" on subscriptions for select using (auth.role() = 'service_role' or user_id = auth.uid());

drop policy if exists "auth_insert_subscriptions" on subscriptions;
create policy "auth_insert_subscriptions" on subscriptions for insert with check (auth.role() = 'service_role');

drop policy if exists "service_update_subscriptions" on subscriptions;
create policy "service_update_subscriptions" on subscriptions for update using (auth.role() = 'service_role');

alter table subscriptions add column if not exists phone text;
`;

const configs = [
  { host: `db.${projectRef}.supabase.co`, port: 5432, user: 'postgres', password, database: 'postgres', label: 'Direct' },
  { host: `aws-0-eu-west-1.pooler.supabase.com`, port: 6543, user: `postgres.${projectRef}`, password, database: 'postgres', label: 'Pooler EU West' },
  { host: `aws-0-eu-central-1.pooler.supabase.com`, port: 6543, user: `postgres.${projectRef}`, password, database: 'postgres', label: 'Pooler EU Central' },
  { host: `aws-0-eu-west-2.pooler.supabase.com`, port: 6543, user: `postgres.${projectRef}`, password, database: 'postgres', label: 'Pooler EU West 2' },
  { host: `${projectRef}.pooler.supabase.com`, port: 6543, user: `postgres.${projectRef}`, password, database: 'postgres', label: 'Pooler Default' },
];

async function tryConnect(config) {
  const client = new Client(config);
  try {
    await client.connect();
    console.log(`  ✓ Connected via ${config.label}`);
    await client.query(sql);
    console.log('  ✓ Migration SQL executed successfully');
    await client.end();
    return true;
  } catch (err) {
    console.log(`  ✗ ${config.label}: ${err.message?.substring(0, 80)}`);
    try { await client.end(); } catch {}
    return false;
  }
}

async function main() {
  console.log('Attempting database migration...\n');
  for (const config of configs) {
    if (await tryConnect(config)) {
      console.log('\n✅ Migration completed successfully!');
      process.exit(0);
    }
  }
  console.log('\n❌ Could not connect to database automatically.');
  console.log('\nPlease run the following SQL manually in your Supabase SQL Editor:');
  console.log('https://supabase.com/dashboard/project/' + projectRef + '/sql/new\n');
  console.log(sql);
  process.exit(1);
}

main().catch(console.error);
