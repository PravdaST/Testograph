// Auto-create admin tables using Supabase service role
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Load environment
const envContent = readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    env[key.trim()] = valueParts.join('=').replace(/"/g, '').trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.NEXT_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

console.log('🚀 Creating admin tables...\n');

// Read SQL files
const sql1 = readFileSync('Testograph/supabase/migrations/20251008000001_create_admin_audit_logs.sql', 'utf8');
const sql2 = readFileSync('Testograph/supabase/migrations/20251008000002_create_admin_users.sql', 'utf8');

// Execute SQL via RPC
async function executeSql(sql, name) {
  try {
    console.log(`⏳ Creating ${name}...`);

    // Split into statements and execute one by one
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--') && s !== '');

    for (const statement of statements) {
      // Use the supabase client to execute raw SQL
      // This requires a custom RPC function or we use REST API directly
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ query: statement })
      });

      // If RPC doesn't exist, try alternative method
      if (response.status === 404) {
        // exec_sql RPC function doesn't exist, we need to use SQL Editor or create it
        throw new Error('exec_sql RPC function not available. Please apply migrations manually through Supabase SQL Editor.');
      }

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`HTTP ${response.status}: ${error}`);
      }
    }

    console.log(`   ✅ ${name} created successfully\n`);
    return true;
  } catch (error) {
    console.error(`   ❌ Error creating ${name}:`, error.message);
    return false;
  }
}

// Execute migrations
const result1 = await executeSql(sql1, 'admin_audit_logs');
const result2 = await executeSql(sql2, 'admin_users');

if (result1 && result2) {
  console.log('✅ All admin tables created successfully!\n');
  console.log('You can now proceed with building the admin panel features.\n');
} else {
  console.log('\n⚠️  Manual migration required:\n');
  console.log('1. Open Supabase Dashboard SQL Editor');
  console.log('2. Copy the SQL from the migration files');
  console.log('3. Execute them manually\n');
}
