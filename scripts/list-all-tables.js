import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://mrpsaqtmucxpawajfxfn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ycHNhcXRtdWN4cGF3YWpmeGZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTA5MTM3OCwiZXhwIjoyMDc0NjY3Mzc4fQ.8wvWlc4rVRyHemfg5_MzogiIVhwKO1g7ui8xAwjW2gQ'
);

async function listAllTables() {
  console.log('🔍 Fetching ALL tables from Supabase DB...\n');
  console.log('='.repeat(70) + '\n');

  // List of common table names to check
  const tablesToCheck = [
    'funnel_sessions',
    'funnel_events',
    'chat_sessions',
    'chat_messages',
    'users',
    'profiles',
    'sessions',
    'test_results',
    'orders',
    'products',
    'payments',
    'subscriptions',
  ];

  const results = {};

  for (const tableName of tablesToCheck) {
    try {
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: false })
        .limit(1);

      if (!error) {
        results[tableName] = {
          exists: true,
          count: count || 0,
          sample: data?.[0] || null,
        };
      }
    } catch (err) {
      // Table doesn't exist or no access
    }
  }

  // Print results
  console.log('📊 FOUND TABLES:\n');

  const existingTables = Object.entries(results).filter(([_, info]) => info.exists);

  if (existingTables.length === 0) {
    console.log('❌ No tables found or no access to tables\n');
    return;
  }

  for (const [tableName, info] of existingTables) {
    console.log(`\n📋 ${tableName.toUpperCase()}`);
    console.log('─'.repeat(70));
    console.log(`   Records: ${info.count}`);

    if (info.sample) {
      console.log('   Columns:', Object.keys(info.sample).join(', '));
      console.log('\n   Sample data:');
      console.log('   ', JSON.stringify(info.sample, null, 2).split('\n').join('\n    '));
    } else if (info.count === 0) {
      console.log('   ⚠️  Table is empty - no data yet');
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log(`\n✅ Found ${existingTables.length} tables total\n`);
}

listAllTables()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
