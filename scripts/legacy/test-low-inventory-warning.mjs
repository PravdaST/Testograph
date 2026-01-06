/**
 * Test low inventory warning display
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

config({ path: join(__dirname, '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials')
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function createLowInventoryUser() {
  const testEmail = 'test-low-inventory@testograph.com'

  console.log('🧪 Creating user with low TestoUp inventory\n')

  // 1. Clean up
  console.log('1️⃣ Cleaning up...')
  await supabase.from('testoup_inventory').delete().eq('email', testEmail)
  await supabase.from('quiz_results_v2').delete().eq('email', testEmail)
  console.log('✅ Cleanup complete\n')

  // 2. Create quiz result
  console.log('2️⃣ Creating quiz result...')
  const { error: quizError } = await supabase.from('quiz_results_v2').insert({
    email: testEmail,
    category: 'energy',
    total_score: 55,
    determined_level: 'normal',
    workout_location: 'home',
    completed_at: new Date().toISOString()
  })

  if (quizError) {
    console.error('❌ Error creating quiz:', quizError)
    return
  }
  console.log('✅ Quiz result created\n')

  // 3. Create low inventory (8 capsules - should trigger warning)
  console.log('3️⃣ Creating LOW inventory (8 capsules)...')
  const { error: invError } = await supabase.from('testoup_inventory').insert({
    email: testEmail,
    total_capsules: 60,
    capsules_remaining: 8,
    last_refill_date: new Date().toISOString()
  })

  if (invError) {
    console.error('❌ Error creating inventory:', invError)
    return
  }
  console.log('✅ Low inventory created\n')

  console.log('📧 Test user email:', testEmail)
  console.log('🔗 Open in browser: http://localhost:3000/app')
  console.log('💾 Save this email in localStorage as "quizEmail"')
  console.log('')
  console.log('Expected to see:')
  console.log('  - 🔴 Red warning triangle')
  console.log('  - 🔴 Red text "8/60 капсули"')
  console.log('  - 🔴 Red progress bar')
  console.log('  - ⚠️  Warning message about low capsules')
}

createLowInventoryUser().catch(console.error)
