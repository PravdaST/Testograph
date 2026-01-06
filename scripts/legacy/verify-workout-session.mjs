import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

config({ path: join(__dirname, '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifySession() {
  console.log('📊 Checking workout session data...\n')

  const { data, error } = await supabase
    .from('workout_sessions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  if (!data) {
    console.log('⚠️  No sessions found')
    return
  }

  console.log('✅ Latest workout session:')
  console.log('─'.repeat(50))
  console.log('Workout:', data.workout_name)
  console.log('Day:', data.day_of_week)
  console.log('Target duration:', data.target_duration_minutes, 'min')
  console.log('Actual duration:', data.actual_duration_minutes, 'min')
  console.log('Status:', data.status)
  console.log('Started at:', new Date(data.started_at).toLocaleTimeString())
  console.log('Finished at:', data.finished_at ? new Date(data.finished_at).toLocaleTimeString() : 'N/A')
  console.log('Total pause time:', data.total_pause_duration_seconds, 'seconds')
  console.log('─'.repeat(50))

  if (data.status === 'completed') {
    console.log('\n🎉 Workout successfully completed and saved to database!')
  }
}

verifySession().catch(console.error)
