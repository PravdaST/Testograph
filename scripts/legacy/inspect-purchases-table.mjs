// Inspect purchases table structure and data
const SUPABASE_URL = "https://mrpsaqtmucxpawajfxfn.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ycHNhcXRtdWN4cGF3YWpmeGZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTA5MTM3OCwiZXhwIjoyMDc0NjY3Mzc4fQ.8wvWlc4rVRyHemfg5_MzogiIVhwKO1g7ui8xAwjW2gQ";

console.log("🔍 INSPECTING PURCHASES TABLE\n");
console.log("=".repeat(60));

try {
  // Get all purchases to see structure
  console.log("\n1️⃣ Fetching all purchases...\n");

  const response = await fetch(`${SUPABASE_URL}/rest/v1/purchases?select=*&limit=10`, {
    method: 'GET',
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Prefer': 'return=representation'
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }

  const purchases = await response.json();

  console.log(`📊 Found ${purchases.length} purchase(s)\n`);

  if (purchases.length > 0) {
    console.log("📋 TABLE STRUCTURE (from first record):\n");
    const sample = purchases[0];
    const columns = Object.keys(sample);

    columns.forEach(col => {
      const value = sample[col];
      const type = Array.isArray(value) ? 'array' : typeof value;
      console.log(`   • ${col.padEnd(25)} → ${type.padEnd(10)} = ${JSON.stringify(value)}`);
    });

    console.log("\n" + "=".repeat(60));
    console.log("\n2️⃣ ALL PURCHASES DATA:\n");

    purchases.forEach((purchase, index) => {
      console.log(`\n📦 Purchase #${index + 1}:`);
      console.log(`   ID: ${purchase.id}`);
      console.log(`   User ID: ${purchase.user_id}`);
      console.log(`   Product Type: ${purchase.product_type || 'N/A'}`);
      console.log(`   Product Name: ${purchase.product_name || 'N/A'}`);
      console.log(`   Apps Included: ${JSON.stringify(purchase.apps_included)}`);
      console.log(`   Status: ${purchase.status}`);
      console.log(`   Shopify Order ID: ${purchase.shopify_order_id || 'N/A'}`);
      console.log(`   Amount: ${purchase.amount} ${purchase.currency || ''}`);
      console.log(`   Purchased At: ${purchase.purchased_at}`);

      if (purchase.expires_at) {
        console.log(`   Expires At: ${purchase.expires_at}`);
      }
    });

    console.log("\n" + "=".repeat(60));
    console.log("\n3️⃣ SUMMARY:\n");

    const uniqueUsers = [...new Set(purchases.map(p => p.user_id))];
    const uniqueProducts = [...new Set(purchases.map(p => p.product_type))];
    const allApps = [...new Set(purchases.flatMap(p => p.apps_included || []))];

    console.log(`   Total Users with purchases: ${uniqueUsers.length}`);
    console.log(`   Product Types: ${uniqueProducts.join(', ')}`);
    console.log(`   All Apps in system: ${allApps.join(', ')}`);

    console.log("\n" + "=".repeat(60));
    console.log("\n4️⃣ YOUR EMAIL (caspere63@gmail.com) CHECK:\n");

    // Now check auth.users for the correct user_id
    console.log("   Need to find your user_id from auth.users...");
    console.log("   Run this SQL in Supabase SQL Editor:\n");
    console.log(`
SELECT
  au.id as user_id,
  au.email,
  COALESCE(
    (SELECT COUNT(*) FROM purchases WHERE user_id = au.id),
    0
  ) as total_purchases
FROM auth.users au
WHERE au.email = 'caspere63@gmail.com';
    `);

  } else {
    console.log("⚠️  No purchases found in table yet");
    console.log("\n📋 TABLE COLUMNS (from schema):");
    console.log("   Cannot determine - table is empty");
    console.log("\n   Expected structure:");
    console.log("   • id");
    console.log("   • user_id");
    console.log("   • product_type");
    console.log("   • product_name");
    console.log("   • apps_included (array)");
    console.log("   • status");
    console.log("   • shopify_order_id");
    console.log("   • amount");
    console.log("   • currency");
    console.log("   • purchased_at");
    console.log("   • expires_at");
    console.log("   • created_at");
    console.log("   • updated_at");
  }

} catch (error) {
  console.error("❌ Error:", error.message);
}

console.log("\n" + "=".repeat(60));
console.log("\n✅ Inspection complete!");
