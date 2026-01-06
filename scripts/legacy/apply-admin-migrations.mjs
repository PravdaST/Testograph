// Script to apply admin panel migrations
// This script will execute the SQL migrations for audit_logs and admin_users tables

import { readFileSync } from 'fs';

console.log('🔧 Admin Panel Migrations\n');
console.log('=' .repeat(60));

// Read .env.local to get credentials
const envContent = readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    env[key.trim()] = valueParts.join('=').replace(/"/g, '').trim();
  }
});

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = env.NEXT_SUPABASE_SERVICE_ROLE_KEY;

console.log(`\n📍 Database: ${SUPABASE_URL}`);
console.log(`\n🔍 Checking if admin tables already exist...\n`);

// Check if tables exist
const checkTables = async () => {
  try {
    // Check admin_audit_logs
    const auditCheck = await fetch(`${SUPABASE_URL}/rest/v1/admin_audit_logs?limit=0`, {
      method: 'HEAD',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
      }
    });

    // Check admin_users
    const usersCheck = await fetch(`${SUPABASE_URL}/rest/v1/admin_users?limit=0`, {
      method: 'HEAD',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
      }
    });

    const auditExists = auditCheck.ok;
    const usersExists = usersCheck.ok;

    console.log(`admin_audit_logs: ${auditExists ? '✅ EXISTS' : '❌ NOT FOUND'}`);
    console.log(`admin_users: ${usersExists ? '✅ EXISTS' : '❌ NOT FOUND'}`);

    if (auditExists && usersExists) {
      console.log('\n✅ All admin tables already exist! No migration needed.\n');
      return true;
    }

    console.log('\n⚠️  Some tables are missing. You need to apply the migrations.\n');
    console.log('📋 INSTRUCTIONS:\n');
    console.log('1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/mrpsaqtmucxpawajfxfn');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Create a new query');
    console.log('4. Copy and paste the SQL from these files:\n');
    console.log('   → Testograph/supabase/migrations/20251008000001_create_admin_audit_logs.sql');
    console.log('   → Testograph/supabase/migrations/20251008000002_create_admin_users.sql\n');
    console.log('5. Run the query');
    console.log('6. Run this script again to verify\n');

    // Show the SQL content
    console.log('=' .repeat(60));
    console.log('\n📄 SQL MIGRATION 1: admin_audit_logs\n');
    console.log('=' .repeat(60));
    const sql1 = readFileSync('Testograph/supabase/migrations/20251008000001_create_admin_audit_logs.sql', 'utf8');
    console.log(sql1);

    console.log('\n' + '=' .repeat(60));
    console.log('\n📄 SQL MIGRATION 2: admin_users\n');
    console.log('=' .repeat(60));
    const sql2 = readFileSync('Testograph/supabase/migrations/20251008000002_create_admin_users.sql', 'utf8');
    console.log(sql2);
    console.log('\n' + '=' .repeat(60) + '\n');

    return false;

  } catch (error) {
    console.error('❌ Error checking tables:', error.message);
    return false;
  }
};

checkTables();
