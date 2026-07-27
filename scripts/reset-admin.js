const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'macyenga@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123!';

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) { console.log('Error:', error.message); return; }

  const admin = data.users.find(u => u.email === ADMIN_EMAIL);
  if (!admin) { console.log('Admin user not found'); return; }

  console.log('Admin user ID:', admin.id);
  console.log('Email:', admin.email);

  const { error: updateError } = await supabase.auth.admin.updateUserById(admin.id, { password: ADMIN_PASSWORD });
  if (updateError) {
    console.log('Password reset failed:', updateError.message);
  } else {
    console.log(`Password reset to: ${ADMIN_PASSWORD}`);
  }

  const { data: insData, error: insError } = await supabase
    .from('admins')
    .insert([{ user_id: admin.id, email: admin.email }])
    .select()
    .maybeSingle();

  if (insError) {
    if (insError.message?.includes('duplicate') || insError.code === '23505') {
      console.log('Admin already in admins table');
    } else {
      console.log('Error adding to admins table:', insError.message);
    }
  } else {
    console.log('Added to admins table');
  }
}

main().catch(e => console.log(e.message));
