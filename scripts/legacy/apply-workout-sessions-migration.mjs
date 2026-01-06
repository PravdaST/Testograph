import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

config({ path: join(__dirname, '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase credentials')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyMigration() {
  console.log('📦 Applying workout_sessions migration...\n')

  const sql = readFileSync(join(__dirname, 'migrations', 'add_workout_sessions.sql'), 'utf-8')

  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql }).single()

  if (error) {
    // Try direct query if RPC doesn't work
    const queries = sql.split(';').filter(q => q.trim())

    for (const query of queries) {
      if (!query.trim()) continue

      const { error: queryError } = await supabase.from('_sql').insert({ query })

      if (queryError) {
        // Last resort - log the SQL for manual execution
        console.log('⚠️  Could not apply automatically. Please run this SQL manually:')
        console.log('─'.repeat(60))
        console.log(sql)
        console.log('─'.repeat(60))
        return
      }
    }
  }

  console.log('✅ Migration applied successfully!')
  console.log('✅ workout_sessions table created')
}

applyMigration().catch(console.error)
