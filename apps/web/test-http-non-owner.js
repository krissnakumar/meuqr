const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local manually
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] ? match[2].trim() : '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    }
    env[match[1]] = value;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const client = createClient(supabaseUrl, anonKey);

async function run() {
  console.log('Signing in as kkk@kk.com...');
  const { data: authData, error: authError } = await client.auth.signInWithPassword({
    email: 'kkk@kk.com',
    password: 'password' // We reset passwords of both users in the previous tests? No, only kk@kk.com
  });
  if (authError) {
    console.error('Sign in failed:', authError);
    return;
  }
  
  const session = authData.session;
  const projectRef = 'myrjmljrcxhutixxhacn';
  const cookieName = `sb-${projectRef}-auth-token`;
  const cookieValue = JSON.stringify(session);
  const cookieHeader = `${cookieName}=${encodeURIComponent(cookieValue)}`;

  console.log('Fetching page...');
  const businessId = '70c1520b-7b36-4b71-9032-a3550ffd42ab';
  
  const res = await fetch(`http://localhost:3001/dashboard/business/${businessId}`, {
    headers: {
      'Cookie': cookieHeader
    },
    redirect: 'manual'
  });
  
  console.log('Status:', res.status);
  console.log('Headers:', Object.fromEntries(res.headers.entries()));
}

// We first need to reset the password of kkk@kk.com to 'password' using the admin client
const clientAdmin = createClient(supabaseUrl, env.SUPABASE_SERVICE_ROLE_KEY);

async function start() {
  console.log('Updating password of kkk@kk.com to "password"...');
  await clientAdmin.auth.admin.updateUserById(
    '625c5bf8-91eb-4738-b09a-3dfd1c6ad033',
    { password: 'password' }
  );
  run();
}

start();
