import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://mrpsaqtmucxpawajfxfn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ycHNhcXRtdWN4cGF3YWpmeGZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTA5MTM3OCwiZXhwIjoyMDc0NjY3Mzc4fQ.8wvWlc4rVRyHemfg5_MzogiIVhwKO1g7ui8xAwjW2gQ'
);

async function scanAllTables() {
  console.log('🔍 Scanning ALL tables in Supabase DB...\n');
  console.log('='.repeat(80) + '\n');

  try {
    // Query information_schema to get all tables
    const { data: tables, error } = await supabase.rpc('get_all_tables', {});

    // If RPC function doesn't exist, try direct query
    if (error) {
      console.log('⚠️  RPC function not available, using fallback method...\n');

      // Try querying known tables from Supabase metadata
      const { data: tablesData, error: metaError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');

      if (metaError) {
        console.log('⚠️  Cannot query information_schema directly\n');
        console.log('📋 Checking common table names...\n');

        // Fallback: Check a comprehensive list of possible tables
        const possibleTables = [
          // Funnel & Analytics
          'funnel_sessions',
          'funnel_events',
          'funnel_steps',
          'analytics_events',

          // Chat & AI
          'chat_sessions',
          'chat_messages',
          'conversations',
          'ai_responses',

          // Users & Auth
          'users',
          'profiles',
          'user_profiles',
          'accounts',
          'sessions',
          'auth_sessions',

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

          // Settings & Config
          'settings',
          'configurations',
          'feature_flags',

          // Tracking
          'page_views',
          'events',
          'user_events',
          'activity_logs',

          // Reports & PDFs
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
        ];

        const foundTables = [];

        for (const tableName of possibleTables) {
          try {
            const { count, error: countError } = await supabase
              .from(tableName)
              .select('*', { count: 'exact', head: true });

            if (!countError) {
              // Get first row to see columns
              const { data: sampleData } = await supabase
                .from(tableName)
                .select('*')
                .limit(1);

              foundTables.push({
                name: tableName,
                count: count || 0,
                columns: sampleData && sampleData.length > 0 ? Object.keys(sampleData[0]) : [],
                sample: sampleData?.[0] || null,
              });
            }
          } catch (err) {
            // Table doesn't exist, skip
          }
        }

        // Display results
        console.log(`📊 FOUND ${foundTables.length} TABLES:\n`);
        console.log('='.repeat(80) + '\n');

        for (const table of foundTables) {
          console.log(`\n📋 ${table.name.toUpperCase()}`);
          console.log('─'.repeat(80));
          console.log(`   Records: ${table.count}`);
          console.log(`   Columns (${table.columns.length}): ${table.columns.join(', ')}`);

          if (table.sample) {
            console.log('\n   Sample data:');
            const sampleStr = JSON.stringify(table.sample, null, 2);
            console.log(
              '   ' +
                sampleStr
                  .split('\n')
                  .map((line, idx) => (idx === 0 ? line : '   ' + line))
                  .join('\n')
            );
          } else if (table.count === 0) {
            console.log('   ⚠️  Table is empty - no data yet');
          }
        }

        console.log('\n' + '='.repeat(80));
        console.log(`\n✅ Found ${foundTables.length} tables total`);
        console.log('\n📈 Tables by category:\n');

        // Categorize tables
        const categories = {
          'Funnel & Analytics': foundTables.filter((t) =>
            ['funnel_', 'analytics_'].some((prefix) => t.name.startsWith(prefix))
          ),
          'Chat & AI': foundTables.filter((t) =>
            ['chat_', 'conversation', 'ai_'].some((prefix) => t.name.startsWith(prefix))
          ),
          'Users & Auth': foundTables.filter((t) =>
            ['user', 'profile', 'account', 'auth', 'session'].some((word) => t.name.includes(word))
          ),
          'E-commerce': foundTables.filter((t) =>
            ['order', 'product', 'payment', 'transaction', 'subscription', 'cart', 'invoice'].some(
              (word) => t.name.includes(word)
            )
          ),
          'Content': foundTables.filter((t) =>
            ['post', 'article', 'page', 'comment', 'media', 'file', 'upload'].some((word) =>
              t.name.includes(word)
            )
          ),
          'Notifications': foundTables.filter((t) =>
            ['notification', 'email', 'push'].some((word) => t.name.includes(word))
          ),
          'Tracking': foundTables.filter((t) =>
            ['page_view', 'event', 'activity', 'log'].some((word) => t.name.includes(word))
          ),
          'Reports': foundTables.filter((t) =>
            ['report', 'test_result', 'assessment'].some((word) => t.name.includes(word))
          ),
          Other: foundTables.filter((t) =>
            ['webhook', 'api_key', 'integration', 'setting', 'config', 'lab', 'location'].some(
              (word) => t.name.includes(word)
            )
          ),
        };

        for (const [category, tables] of Object.entries(categories)) {
          if (tables.length > 0) {
            console.log(`   ${category}:`);
            tables.forEach((t) => {
              console.log(`      - ${t.name} (${t.count} records)`);
            });
            console.log('');
          }
        }

        return;
      }
    }

    console.log('✅ Tables retrieved from information_schema\n');
    console.log(tables);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

scanAllTables()
  .then(() => {
    console.log('\n✅ DB scan complete!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
