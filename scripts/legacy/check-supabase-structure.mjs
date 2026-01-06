// Using native fetch (Node.js 18+)
const SUPABASE_URL = "https://mrpsaqtmucxpawajfxfn.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ycHNhcXRtdWN4cGF3YWpmeGZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTA5MTM3OCwiZXhwIjoyMDc0NjY3Mzc4fQ.8wvWlc4rVRyHemfg5_MzogiIVhwKO1g7ui8xAwjW2gQ";

console.log("🔍 CHECKING SUPABASE DATABASE STRUCTURE...\n");

// List of all possible tables to check
const knownTables = [
  'profiles', 'purchases', 'daily_entries_pro', 'weekly_measurements_pro',
  'agents', 'chat_messages', 'chat_sessions', 'conversations', 'messages',
  'user_settings', 'meal_plans', 'sleep_logs', 'lab_results', 'analytics_events',
  'meal_plans_app', 'sleep_logs_app', 'lab_results_app', 'analytics_events_app',
  'exercise_guide', 'lab_locations'
];

const tables = [];

console.log("📊 SCANNING FOR TABLES:\n");

for (const table of knownTables) {
  const testResponse = await fetch(`${SUPABASE_URL}/rest/v1/${table}?limit=0`, {
    method: 'GET',
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
    }
  });

  if (testResponse.ok) {
    tables.push(table);
    console.log(`  ✅ ${table}`);
  }
}

console.log(`\n📈 Total tables found: ${tables.length}\n`);
console.log("=" .repeat(60));

// Check purchases table in detail
console.log("\n1️⃣  PURCHASES TABLE:\n");
const purchasesCheck = await fetch(`${SUPABASE_URL}/rest/v1/purchases?limit=0`, {
  method: 'HEAD',
  headers: {
    'apikey': SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
  }
});

if (purchasesCheck.ok) {
  console.log("   ✅ TABLE EXISTS\n");

  // Get sample data
  const purchasesData = await fetch(`${SUPABASE_URL}/rest/v1/purchases?limit=1`, {
    method: 'GET',
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Prefer': 'return=representation'
    }
  });

  if (purchasesData.ok) {
    const data = await purchasesData.json();
    if (data.length > 0) {
      console.log("   COLUMNS:");
      const sample = data[0];
      Object.keys(sample).sort().forEach(key => {
        const type = Array.isArray(sample[key]) ? 'array' : typeof sample[key];
        console.log(`      • ${key} (${type})`);
      });

      // Check for specific fields
      console.log("\n   KEY FIELDS CHECK:");
      const requiredFields = ['user_id', 'product_type', 'apps_included', 'status', 'shopify_order_id'];
      requiredFields.forEach(field => {
        if (field in sample) {
          console.log(`      ✅ ${field}`);
        } else {
          console.log(`      ❌ ${field} - MISSING`);
        }
      });
    } else {
      console.log("   ⚠️  Table is EMPTY - cannot determine structure from data");
      console.log("   Need to check schema directly via SQL");
    }
  }
} else {
  console.log("   ❌ TABLE DOES NOT EXIST\n");
}

// Check profiles table
console.log("\n" + "=" .repeat(60));
console.log("\n2️⃣  PROFILES TABLE:\n");

const profilesCheck = await fetch(`${SUPABASE_URL}/rest/v1/profiles?limit=0`, {
  method: 'HEAD',
  headers: {
    'apikey': SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
  }
});

if (profilesCheck.ok) {
  console.log("   ✅ TABLE EXISTS\n");

  const profilesData = await fetch(`${SUPABASE_URL}/rest/v1/profiles?limit=1`, {
    method: 'GET',
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Prefer': 'return=representation'
    }
  });

  if (profilesData.ok) {
    const data = await profilesData.json();
    if (data.length > 0) {
      console.log("   COLUMNS:");
      const sample = data[0];
      Object.keys(sample).sort().forEach(key => {
        console.log(`      • ${key}`);
      });

      console.log("\n   PRO FIELD CHECK:");
      if ('protocol_start_date_pro' in sample) {
        console.log(`      ✅ protocol_start_date_pro EXISTS`);
      } else {
        console.log(`      ❌ protocol_start_date_pro MISSING`);
      }
    } else {
      console.log("   ⚠️  Table is EMPTY");
    }
  }
} else {
  console.log("   ❌ TABLE DOES NOT EXIST\n");
}

// Check PRO tables
console.log("\n" + "=" .repeat(60));
console.log("\n3️⃣  TESTOGRAPH-PRO TABLES:\n");

const proTables = ['daily_entries_pro', 'weekly_measurements_pro'];
for (const table of proTables) {
  const check = await fetch(`${SUPABASE_URL}/rest/v1/${table}?limit=1`, {
    method: 'GET',
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
    }
  });

  if (check.ok) {
    const data = await check.json();
    console.log(`   ✅ ${table}`);
    if (data.length > 0) {
      const cols = Object.keys(data[0]).join(', ');
      console.log(`      Columns: ${cols}`);
    }
  } else {
    console.log(`   ❌ ${table} - MISSING`);
  }
}

console.log("\n" + "=".repeat(60));
console.log("\n✅ SUPABASE CHECK COMPLETE!\n");
