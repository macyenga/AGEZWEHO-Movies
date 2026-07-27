const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
  process.exit(1);
}

// Extract project ref from URL
const PROJECT_REF = SUPABASE_URL.replace('https://', '').split('.')[0];

const CONFIGS = [
  { host: `db.${PROJECT_REF}.supabase.co`, port: 5432, label: 'Direct DB' },
  { host: `aws-0-eu-west-1.pooler.supabase.com`, port: 6543, user: `postgres.${PROJECT_REF}`, label: 'Pooler EU West' },
  { host: `aws-0-eu-central-1.pooler.supabase.com`, port: 6543, user: `postgres.${PROJECT_REF}`, label: 'Pooler EU Central' },
  { host: `aws-0-eu-west-2.pooler.supabase.com`, port: 6543, user: `postgres.${PROJECT_REF}`, label: 'Pooler EU West 2' },
  { host: `${PROJECT_REF}.pooler.supabase.com`, port: 6543, label: 'Pooler Default' },
];

async function run() {
  console.log('Reading schema.sql...');
  const sql = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'schema.sql'), 'utf8');

  // Use Supabase Management API to run SQL via the SQL endpoint
  console.log(`\nTrying Supabase REST SQL endpoint...`);
  try {
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

    console.log(`\n✅ ${ok} ok, ${err} failed`);
    if (err === 0) {
      console.log('\nSchema applied successfully!');
      return;
    }
  } catch (e) {
    console.log(`  ${e.message?.substring(0, 100)}`);
  }

  console.log('\n⚠️  Could not auto-connect. Run schema manually at:');
  console.log(`https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new`);
}

run().catch(console.error);
