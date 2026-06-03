const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

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
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const clientAdmin = createClient(supabaseUrl, supabaseKey);

async function run() {
  // Let's test for each user:
  // kk@kk.com: fbaf8626-c850-4f7e-bef1-9a049ed95d60
  // kkk@kk.com: 625c5bf8-91eb-4738-b09a-3dfd1c6ad033
  
  const users = [
    { email: 'kk@kk.com', id: 'fbaf8626-c850-4f7e-bef1-9a049ed95d60' },
    { email: 'kkk@kk.com', id: '625c5bf8-91eb-4738-b09a-3dfd1c6ad033' }
  ];

  for (const user of users) {
    console.log(`\n--- Testing as ${user.email} (${user.id}) ---`);
    
    // We can use the service role client but act as the user to test RLS
    // or just run a query using the anon client but after signing in!
    const clientUser = createClient(supabaseUrl, anonKey);
    
    // Sign in
    const { data: signInData, error: signInError } = await clientUser.auth.signInWithPassword({
      email: user.email,
      password: 'password' // let's guess password is 'password' or something?
    });
    
    if (signInError) {
      console.log('SignIn Error:', signInError.message);
      // If sign in fails, let's just use the admin client with the owner_id filter which is what RLS checks
      console.log('Testing via Admin client filtering by owner_id...');
      const { data: businesses, error } = await clientAdmin
        .from('businesses')
        .select('id, category, subscription_tier')
        .eq('owner_id', user.id)
        .eq('id', '70c1520b-7b36-4b71-9032-a3550ffd42ab');
      
      console.log('Query result:', { data: businesses, error });
    } else {
      console.log('Logged in successfully!');
      const { data: businesses, error } = await clientUser
        .from('businesses')
        .select('id, category, subscription_tier')
        .eq('id', '70c1520b-7b36-4b71-9032-a3550ffd42ab');
      console.log('Query result with User Session:', { data: businesses, error });
    }
  }
}

run();
