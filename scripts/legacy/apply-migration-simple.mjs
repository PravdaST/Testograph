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

async function createTable() {
  console.log('📦 Creating workout_sessions table...\n')

  // Create table
  const { error: tableError } = await supabase.rpc('exec', {
    sql: `
      CREATE TABLE IF NOT EXISTS workout_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT NOT NULL,
        date DATE NOT NULL,
        day_of_week INTEGER NOT NULL,
        workout_name TEXT NOT NULL,
        target_duration_minutes INTEGER NOT NULL,
        actual_duration_minutes INTEGER,
        started_at TIMESTAMP WITH TIME ZONE NOT NULL,
        paused_at TIMESTAMP WITH TIME ZONE,
        finished_at TIMESTAMP WITH TIME ZONE,
        total_pause_duration_seconds INTEGER DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'in_progress',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
  })

  if (tableError) {
    console.error('Error:', tableError)
    console.log('\n⚠️  Please run the SQL manually from migrations/add_workout_sessions.sql')
    return
  }

  console.log('✅ Table created successfully!')
}

createTable().catch(console.error)
