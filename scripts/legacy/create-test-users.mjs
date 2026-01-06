/**
 * Create test users with different quiz levels (LOW/NORMAL/HIGH)
 * For testing the 3-level personalization system
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env.local
dotenv.config({ path: join(__dirname, '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Test users for each level
const testUsers = [
  {
    email: 'test-low@testograph.com',
    category: 'muscle',
    total_score: 30,
    determined_level: 'low',
    workout_location: 'gym',
    breakdown: {
      symptoms: 3,
      nutrition: 3,
      training: 3,
      sleep_recovery: 3,
      context: 3,
      overall: 30
    }
  },
  {
    email: 'test-normal@testograph.com',
    category: 'energy',
    total_score: 55,
    determined_level: 'normal',
    workout_location: 'home',
    breakdown: {
      symptoms: 5,
      nutrition: 6,
      training: 5,
      sleep_recovery: 6,
      context: 5,
      overall: 55
    }
  },
  {
    email: 'test-high@testograph.com',
    category: 'libido',
    total_score: 85,
    determined_level: 'high',
    workout_location: 'gym',
    breakdown: {
      symptoms: 8,
      nutrition: 9,
      training: 8,
      sleep_recovery: 9,
      context: 8,
      overall: 85
    }
  }
]

async function createTestUsers() {
  console.log('🔧 Creating test users for level testing...\n')

  for (const user of testUsers) {
    console.log(`\n📝 Creating ${user.determined_level.toUpperCase()} level user: ${user.email}`)
    console.log(`   Score: ${user.total_score}, Category: ${user.category}, Location: ${user.workout_location}`)

    // Delete existing quiz results for this email
    const { error: deleteError } = await supabase
      .from('quiz_results_v2')
      .delete()
      .eq('email', user.email)

    if (deleteError) {
      console.log(`   ⚠️  Could not delete existing results: ${deleteError.message}`)
    }

    // Insert new quiz result
    const { data, error } = await supabase
      .from('quiz_results_v2')
      .insert([
        {
          email: user.email,
          category: user.category,
          total_score: user.total_score,
          determined_level: user.determined_level,
          workout_location: user.workout_location,
          breakdown_symptoms: user.breakdown.symptoms,
          breakdown_nutrition: user.breakdown.nutrition,
          breakdown_training: user.breakdown.training,
          breakdown_sleep_recovery: user.breakdown.sleep_recovery,
          breakdown_context: user.breakdown.context,
          breakdown_overall: user.breakdown.overall,
          completed_at: new Date().toISOString()
        }
      ])
      .select()

    if (error) {
      console.error(`   ❌ Error: ${error.message}`)
    } else {
      console.log(`   ✅ Created successfully!`)
    }
  }

  console.log('\n\n✅ All test users created!')
  console.log('\n📋 Test URLs:')
  console.log('   LOW level (muscle, gym):')
  console.log('   → localStorage.setItem("quizEmail", "test-low@testograph.com")')
  console.log('   → http://localhost:3000/app')
  console.log('')
  console.log('   NORMAL level (energy, home):')
  console.log('   → localStorage.setItem("quizEmail", "test-normal@testograph.com")')
  console.log('   → http://localhost:3000/app')
  console.log('')
  console.log('   HIGH level (libido, gym):')
  console.log('   → localStorage.setItem("quizEmail", "test-high@testograph.com")')
  console.log('   → http://localhost:3000/app')
}

createTestUsers()
