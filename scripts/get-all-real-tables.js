import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://mrpsaqtmucxpawajfxfn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ycHNhcXRtdWN4cGF3YWpmeGZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTA5MTM3OCwiZXhwIjoyMDc0NjY3Mzc4fQ.8wvWlc4rVRyHemfg5_MzogiIVhwKO1g7ui8xAwjW2gQ'
);

async function getAllRealTables() {
  console.log('🔍 Fetching ALL REAL tables from Supabase...\n');
  console.log('='.repeat(80) + '\n');

  // Skip RPC attempts - go directly to table checking
  console.log('📋 Checking ALL possible tables exhaustively...\n');

  const knownTables = [
    // Testograph main
    'profiles',
    'chat_sessions',
    'chat_messages',
    'funnel_sessions',
    'funnel_events',
    'funnel_steps',
    'agents',
    'conversations',
    'messages',
    'user_settings',

    // Testograph-app specific
    'meal_plans',
    'sleep_logs',
    'exercise_logs',
    'supplement_logs',
    'body_measurements',
    'lab_locations',
    'purchases',
    'app_access',
    'daily_logs',
    'protocol_templates',
    'user_protocols',
    'workout_plans',
    'workout_sessions',

    // E-commerce
    'orders',
    'order_items',
    'products',
    'product_variants',
    'payments',
    'transactions',
    'subscriptions',
    'invoices',
    'carts',
    'cart_items',

    // Auth & Users
    'users',
    'user_profiles',
    'accounts',
    'sessions',
    'auth_sessions',

    // Analytics
    'analytics_events',
    'page_views',
    'events',
    'user_events',
    'activity_logs',

    // Content
    'posts',
    'articles',
    'pages',
    'comments',
    'media',
    'files',
    'uploads',

    // Notifications
    'notifications',
    'emails',
    'email_logs',
    'push_notifications',

    // Settings
    'settings',
    'configurations',
    'feature_flags',

    // Reports
    'reports',
    'pdf_reports',
    'test_results',
    'assessments',

    // Other
    'webhooks',
    'api_keys',
    'integrations',
    'labs',
    'locations',
    'ai_responses',
  ];

  const foundTables = [];

  for (const tableName of knownTables) {
    try {
      const { count, error: countError } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (!countError) {
        // Get sample to see columns
        const { data: sample } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        const columns = sample && sample.length > 0 ? Object.keys(sample[0]) : [];

        foundTables.push({
          name: tableName,
          count: count || 0,
          columns: columns,
          sample: sample?.[0] || null
        });

        console.log(`✅ ${tableName} - ${count || 0} records, ${columns.length} columns`);
      }
    } catch (err) {
      // Skip
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log(`\n✅ Found ${foundTables.length} tables\n`);

  foundTables.forEach(table => {
    console.log(`\n📋 ${table.name.toUpperCase()}`);
    console.log('─'.repeat(80));
    console.log(`   Records: ${table.count}`);
    console.log(`   Columns (${table.columns.length}): ${table.columns.join(', ')}`);

    if (table.sample) {
      console.log('\n   Sample data:');
      console.log('   ' + JSON.stringify(table.sample, null, 2).split('\n').join('\n   '));
    }
  });
}

getAllRealTables()
  .then(() => {
    console.log('\n✅ Complete!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
