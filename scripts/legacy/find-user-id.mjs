// Find user ID by email
const SUPABASE_URL = "https://mrpsaqtmucxpawajfxfn.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ycHNhcXRtdWN4cGF3YWpmeGZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTA5MTM3OCwiZXhwIjoyMDc0NjY3Mzc4fQ.8wvWlc4rVRyHemfg5_MzogiIVhwKO1g7ui8xAwjW2gQ";

const EMAIL = "caspere63@gmail.com";

console.log(`🔍 Searching for user: ${EMAIL}\n`);

try {
  // Check profiles table
  console.log("1️⃣ Checking profiles table...");
  const profilesResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?select=id,name,created_at`,
    {
      method: 'GET',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
      }
    }
  );

  if (profilesResponse.ok) {
    const profiles = await profilesResponse.json();
    console.log(`   Found ${profiles.length} profiles total\n`);

    if (profiles.length > 0) {
      console.log("   All profiles:");
      profiles.forEach((p, i) => {
        console.log(`   ${i+1}. ID: ${p.id}`);
        console.log(`      Name: ${p.name || 'N/A'}`);
        console.log(`      Created: ${p.created_at}`);
        console.log();
      });
    }
  }

  // Try to use Supabase Admin API to list auth users
  console.log("2️⃣ Trying to find user in auth.users via profiles...");

  // Since we can't directly query auth.users with REST API,
  // let's use the user_id from the session
  console.log("\n📋 SOLUTION:");
  console.log("Run this in Supabase SQL Editor to find the correct user_id:");
  console.log(`
SELECT
  au.id,
  au.email,
  au.created_at,
  p.name
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
WHERE au.email = '${EMAIL}';
  `);

  console.log("\n💡 Or, you can check the browser console:");
  console.log("1. Open browser DevTools (F12)");
  console.log("2. Go to Console tab");
  console.log("3. Run this:");
  console.log(`
const supabase = createClient();
const { data: { user } } = await supabase.auth.getUser();
console.log('User ID:', user.id);
  `);

} catch (error) {
  console.error("❌ Error:", error.message);
}
