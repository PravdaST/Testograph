const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://mrpsaqtmucxpawajfxfn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ycHNhcXRtdWN4cGF3YWpmeGZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTA5MTM3OCwiZXhwIjoyMDc0NjY3Mzc4fQ.8wvWlc4rVRyHemfg5_MzogiIVhwKO1g7ui8xAwjW2gQ'
);

async function checkTables() {
  const possibleTables = [
    'goals_app', 'objectives_app', 'plans_app', 'progress_app', 'unlocked_apps_app',
    'user_goals_app', 'user_progress_app', 'user_apps_app', 'applications_app',
    'meal_plans_app', 'workout_plans_app', 'sleep_logs_app', 'body_measurements_app',
    'protocols_app', 'assessments_app', 'onboarding_app', 'journey_app',
    'goals_pro', 'objectives_pro', 'plans_pro', 'progress_pro', 'unlocked_apps_pro',
    'user_goals_pro', 'user_progress_pro', 'user_apps_pro', 'applications_pro',
    'meal_plans_pro', 'workout_plans_pro', 'sleep_logs_pro', 'body_measurements_pro',
    'protocols_pro', 'assessments_pro', 'onboarding_pro', 'journey_pro'
  ];
  
  console.log('Checking for _app and _pro tables...\n');
  
  const found = { app: [], pro: [] };
  
  for (const table of possibleTables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (!error) {
        const type = table.endsWith('_app') ? 'app' : 'pro';
        found[type].push({ name: table, count: count || 0 });
        console.log(`Found: ${table} (${count || 0} records)`);
      }
    } catch (e) {}
  }
  
  console.log(`\nSummary:`);
  console.log(`  _app tables: ${found.app.length}`);
  console.log(`  _pro tables: ${found.pro.length}`);
  
  if (found.app.length > 0 || found.pro.length > 0) {
    console.log('\nGetting sample data...\n');
    
    const allTables = [...found.app, ...found.pro];
    for (const table of allTables) {
      const { data } = await supabase
        .from(table.name)
        .select('*')
        .limit(1);
      
      if (data && data.length > 0) {
        console.log(`\n${table.name}:`);
        console.log(JSON.stringify(data[0], null, 2));
      }
    }
  }
}

checkTables().then(() => process.exit(0)).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
