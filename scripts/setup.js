const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (!SERVICE_KEY || !SUPABASE_URL) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL env vars');
  process.exit(1);
}

async function run() {
  console.log('1. Creating admin user via Supabase Auth Admin API...');
  const resp = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'apikey': SERVICE_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: process.env.ADMIN_EMAIL || 'macyenga@gmail.com',
      password: process.env.ADMIN_PASSWORD || 'Admin123!',
      email_confirm: true,
    }),
  });

  const result = await resp.json();
  if (resp.ok) {
    console.log('   ✅ Admin user created: macyenga@gmail.com / Admin123!');
  } else if (result.msg?.includes('already exists') || result.message?.includes('already exists')) {
    console.log('   ✅ Admin user already exists');
  } else {
    console.log('   ⚠️ ', result.msg || result.message || JSON.stringify(result).substring(0, 100));
    console.log('   (User may already exist — that is fine)');
  }

  console.log('\n2. Checking if new tables exist...');
  const tables = ['transactions', 'premium_access_requests'];
  for (const table of tables) {
    try {
      const check = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=id&limit=1`, {
        headers: {
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'apikey': SERVICE_KEY,
        },
      });
      if (check.ok) {
        console.log(`   ✅ Table "${table}" exists`);
      } else {
        const text = await check.text();
        if (text.includes('relation') && text.includes('does not exist')) {
          console.log(`   ❌ Table "${table}" does NOT exist`);
        } else {
          console.log(`   ⚠️  ${text.substring(0, 80)}`);
        }
      }
    } catch (e) {
      console.log(`   ❌ ${e.message}`);
    }
  }

  console.log('\n═══════════════════════════════════════');
  console.log('  SETUP SUMMARY');
  console.log('═══════════════════════════════════════');
  console.log('');
  console.log('  Admin login:  macyenga@gmail.com');
  console.log('  Password:     Admin123!');
  console.log('');
  console.log('  Login URL:    http://localhost:3000/auth/login');
  console.log('  Admin URL:    http://localhost:3000/admin');
  console.log('');
  console.log('  ⚠️  Database schema needs manual migration:');
  console.log('  1. Open: https://supabase.com/dashboard/project/rsfdrqhcxuypoqhymxwr/sql/new');
  console.log('  2. Open: supabase/schema.sql in a text editor');
  console.log('  3. Copy everything and paste into SQL Editor');
  console.log('  4. Click "Run"');
  console.log('═══════════════════════════════════════');
}

run().catch(console.error);
