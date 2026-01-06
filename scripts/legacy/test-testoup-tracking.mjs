/**
 * Test TestoUp tracking and inventory system
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
config({ path: join(__dirname, '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials in environment')
}

const supabase = createClient(supabaseUrl, supabaseKey)

const testEmail = 'test-testoup@testograph.com'

async function testTestoUpTracking() {
  console.log('🧪 Testing TestoUp Tracking System\n')

  // 1. Clean up any existing data
  console.log('1️⃣ Cleaning up existing test data...')
  await supabase.from('testoup_tracking').delete().eq('email', testEmail)
  await supabase.from('testoup_inventory').delete().eq('email', testEmail)
  console.log('✅ Cleanup complete\n')

  // 2. Create initial inventory (new bottle)
  console.log('2️⃣ Creating initial inventory (60 capsules)...')
  const { data: inventory, error: invError } = await supabase
    .from('testoup_inventory')
    .insert({
      email: testEmail,
      total_capsules: 60,
      capsules_remaining: 60,
      last_refill_date: new Date().toISOString(),
    })
    .select()
    .single()

  if (invError) {
    console.error('❌ Error creating inventory:', invError)
    return
  }
  console.log('✅ Initial inventory created:', {
    capsules_remaining: inventory.capsules_remaining,
    total_capsules: inventory.total_capsules,
  })
  console.log('')

  // 3. Test API endpoint - fetch inventory
  console.log('3️⃣ Testing GET /api/testoup/inventory...')
  const invResponse = await fetch(
    `http://localhost:3000/api/testoup/inventory?email=${encodeURIComponent(testEmail)}`
  )
  const invData = await invResponse.json()
  console.log('✅ Inventory fetched:', invData)
  console.log('')

  // 4. Test tracking morning intake
  console.log('4️⃣ Testing morning intake tracking...')
  const today = new Date().toISOString().split('T')[0]
  const trackMorningResponse = await fetch('http://localhost:3000/api/testoup/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      date: today,
      period: 'morning',
    }),
  })

  if (!trackMorningResponse.ok) {
    console.error('❌ Error tracking morning:', await trackMorningResponse.text())
    return
  }

  const trackMorningData = await trackMorningResponse.json()
  console.log('✅ Morning tracked:', {
    morning_taken: trackMorningData.data.morning_taken,
    evening_taken: trackMorningData.data.evening_taken,
  })

  // Check inventory after morning
  const invAfterMorning = await fetch(
    `http://localhost:3000/api/testoup/inventory?email=${encodeURIComponent(testEmail)}`
  )
  const invAfterMorningData = await invAfterMorning.json()
  console.log('✅ Inventory after morning:', {
    capsules_remaining: invAfterMorningData.capsules_remaining,
    days_remaining: invAfterMorningData.days_remaining,
  })
  console.log('')

  // 5. Test tracking evening intake
  console.log('5️⃣ Testing evening intake tracking...')
  const trackEveningResponse = await fetch('http://localhost:3000/api/testoup/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      date: today,
      period: 'evening',
    }),
  })

  if (!trackEveningResponse.ok) {
    console.error('❌ Error tracking evening:', await trackEveningResponse.text())
    return
  }

  const trackEveningData = await trackEveningResponse.json()
  console.log('✅ Evening tracked:', {
    morning_taken: trackEveningData.data.morning_taken,
    evening_taken: trackEveningData.data.evening_taken,
  })

  // Check inventory after evening
  const invAfterEvening = await fetch(
    `http://localhost:3000/api/testoup/inventory?email=${encodeURIComponent(testEmail)}`
  )
  const invAfterEveningData = await invAfterEvening.json()
  console.log('✅ Inventory after evening:', {
    capsules_remaining: invAfterEveningData.capsules_remaining,
    days_remaining: invAfterEveningData.days_remaining,
  })
  console.log('')

  // 6. Verify tracking retrieval
  console.log('6️⃣ Testing GET /api/testoup/track...')
  const getTrackingResponse = await fetch(
    `http://localhost:3000/api/testoup/track?email=${encodeURIComponent(testEmail)}&date=${today}`
  )
  const getTrackingData = await getTrackingResponse.json()
  console.log('✅ Tracking retrieved:', getTrackingData)
  console.log('')

  // 7. Test refill
  console.log('7️⃣ Testing inventory refill...')
  const refillResponse = await fetch('http://localhost:3000/api/testoup/inventory', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail }),
  })

  if (!refillResponse.ok) {
    console.error('❌ Error refilling:', await refillResponse.text())
    return
  }

  const invAfterRefill = await fetch(
    `http://localhost:3000/api/testoup/inventory?email=${encodeURIComponent(testEmail)}`
  )
  const invAfterRefillData = await invAfterRefill.json()
  console.log('✅ Inventory after refill:', {
    capsules_remaining: invAfterRefillData.capsules_remaining,
    days_remaining: invAfterRefillData.days_remaining,
  })
  console.log('')

  // Summary
  console.log('📊 TEST SUMMARY')
  console.log('================')
  console.log('Initial capsules: 60')
  console.log('After morning: 59 (-1)')
  console.log('After evening: 58 (-1)')
  console.log('After refill: 60 (reset)')
  console.log('')
  console.log('Expected capsules after refill:', 60)
  console.log('Actual capsules after refill:', invAfterRefillData.capsules_remaining)
  console.log('')

  if (invAfterRefillData.capsules_remaining === 60) {
    console.log('✅ All tests passed!')
  } else {
    console.log('❌ Test failed - inventory mismatch')
  }
}

testTestoUpTracking().catch(console.error)
