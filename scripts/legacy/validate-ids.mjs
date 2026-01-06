import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const workoutDir = path.join(__dirname, 'testograph-v2', 'lib', 'data')
const files = fs.readdirSync(workoutDir).filter(f =>
  f.startsWith('mock-workouts-') && f.endsWith('.ts')
)

console.log('🔍 Validating all exercise IDs...\n')

let totalChecked = 0
let invalidCount = 0
const invalidIds = new Set()

files.forEach(file => {
  const content = fs.readFileSync(path.join(workoutDir, file), 'utf-8')
  const regex = /exercisedb_id:\s*['"]([^'"]+)['"]/g
  let match

  while ((match = regex.exec(content)) !== null) {
    const id = match[1]
    if (id === 'string') continue // Skip TypeScript type definition

    totalChecked++

    if (!/^[a-zA-Z0-9]{7}$/.test(id)) {
      invalidCount++
      invalidIds.add(id)
      console.log(`❌ ${file}: "${id}" (${id.length} chars)`)
    }
  }
})

if (invalidCount === 0) {
  console.log(`\n✅ SUCCESS! All ${totalChecked} exercise IDs are valid 7-character codes!`)
} else {
  console.log(`\n⚠️  Found ${invalidCount} invalid IDs:`)
  invalidIds.forEach(id => console.log(`   - "${id}"`))
}
