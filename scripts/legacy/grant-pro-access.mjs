// Grant Testograph PRO access to user
const SUPABASE_URL = "https://mrpsaqtmucxpawajfxfn.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ycHNhcXRtdWN4cGF3YWpmeGZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTA5MTM3OCwiZXhwIjoyMDc0NjY3Mzc4fQ.8wvWlc4rVRyHemfg5_MzogiIVhwKO1g7ui8xAwjW2gQ";

const USER_ID = "a33b9260-97af-46b0-b018-d21930ea2a1f";

console.log("🚀 Granting Testograph PRO access...\n");

const purchaseData = {
  user_id: USER_ID,
  product_type: "testograph-pro",
  product_name: "Testograph PRO - 28 Day Protocol",
  apps_included: ["testograph-pro"],
  status: "completed",
  shopify_order_id: `manual-grant-${Date.now()}`,
  amount: 197.00,
  currency: "BGN",
  purchased_at: new Date().toISOString()
};

console.log("📦 Purchase data:");
console.log(JSON.stringify(purchaseData, null, 2));
console.log();

try {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/purchases`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(purchaseData)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HTTP ${response.status}: ${error}`);
  }

  const result = await response.json();

  console.log("✅ SUCCESS! Purchase created:");
  console.log(JSON.stringify(result, null, 2));
  console.log();
  console.log("🎉 User now has access to Testograph PRO!");
  console.log();
  console.log("📋 Next steps:");
  console.log("1. Refresh the browser (F5)");
  console.log("2. Try to access: http://localhost:3003/protocol-1");
  console.log("3. You should now have full access! ✅");

} catch (error) {
  console.error("❌ Error:", error.message);

  console.log("\n🔧 Alternative: Run this SQL in Supabase SQL Editor:");
  console.log(`
INSERT INTO purchases (
  user_id,
  product_type,
  product_name,
  apps_included,
  status,
  shopify_order_id,
  amount,
  currency
) VALUES (
  '${USER_ID}',
  'testograph-pro',
  'Testograph PRO - 28 Day Protocol',
  ARRAY['testograph-pro'],
  'completed',
  'manual-grant-${Date.now()}',
  197.00,
  'BGN'
);
  `);
}
