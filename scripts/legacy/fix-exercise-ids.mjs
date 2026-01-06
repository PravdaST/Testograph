/**
 * Script to fix all invalid exercise IDs in workout files
 * Replaces text-based IDs with proper 7-character GIF codes from exercises.json
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load exercises database
const exercisesPath = path.join(__dirname, 'testograph-v2', 'lib', 'data', 'exercises.json')
const exercises = JSON.parse(fs.readFileSync(exercisesPath, 'utf-8'))

// Create exercise lookup maps
const exercisesByName = new Map()
const exercisesByKeyword = new Map()

exercises.forEach(ex => {
  // Map by full name
  exercisesByName.set(ex.name.toLowerCase(), ex.exerciseId)

  // Map by keywords (for better matching)
  const keywords = ex.name.toLowerCase().split(/[\s-]+/)
  keywords.forEach(keyword => {
    if (keyword.length > 3) {
      if (!exercisesByKeyword.has(keyword)) {
        exercisesByKeyword.set(keyword, [])
      }
      exercisesByKeyword.get(keyword).push({
        id: ex.exerciseId,
        name: ex.name,
        equipment: ex.equipments[0]
      })
    }
  })
})

// Manual mappings for common exercises that might not match exactly
const manualMappings = {
  // Push-up variations
  'pike-pushup': 'sVvXT5J', // exercise ball pike push up
  'incline-pushup': 'F7vjXqT', // incline push-up (on box)
  'decline-pushup': 'i5cEhka', // decline push-up
  'diamond-pushup': 'soIB2rj', // diamond push-up
  'wide-pushup': 'I4hDWkc', // standard push-up (closest)

  // Dips variations
  'chair-dips': '7aVz15j', // tricep dips
  'dips-chair': '7aVz15j', // tricep dips

  // Pull-up variations
  'wide-grip-pullup': 'Qqi7bko', // wide grip pull-up
  'chin-up': 'T2mxWqc', // chin-up
  'chin-up-negative': 'T2mxWqc', // chin-up

  // Glute exercises
  'single-leg-glute-bridge': 'aWedzZX', // glute bridge two legs on bench (closest)
  'glute-bridge': 'GibBPPg',

  // Bulgarian & Nordic
  'bulgarian-split-squat': '5bpPTHv', // pistol squat (closest single-leg)
  'nordic-curl': '17lJ1kr', // leg curl (closest)

  // Shoulder exercises
  'handstand': 'XooAdhl', // handstand
  'handstand-hold': 'XooAdhl', // handstand

  // Back exercises
  'face-pull': 'G61cXLk', // cable kneeling rear delt row
  'face-pulls': 'G61cXLk',
  'rear-delt-fly': 'XUUD0Fs', // dumbbell lying rear delt row

  // Cardio equipment
  'treadmill-run': 'rjiM4L3', // walking on incline treadmill (closest)
  'treadmill-sprint': 'rjiM4L3',
  'rowing-machine': 'dmgMp3n', // barbell row (closest)
  'assault-bike': '1ZFqTDN', // air bike
  'battle-ropes': 'UHJlbu3', // kettlebell swing (closest cardio)

  // Recovery & mobility
  'foam-rolling': 'YUYAMEj', // assisted prone lying quads stretch
  'stretching': '1jXLYEw', // standing lateral stretch
  'yoga-flow': 'bWlZvXh', // butterfly yoga pose

  // Jumping exercises
  'jumping-lunge': 'PM1PZjg', // jump lunge
  'jump-lunge': 'PM1PZjg',
  'calf-jump': '2ORFMoR', // calf raise (closest)

  // Core exercises
  'ab-wheel': 'q2ADGqV', // cable crunch (closest)
  'pec-deck': 'FVmZVhk', // cable fly (closest)
  'scapular-pushup': 'uTBt1HV', // scapular pull-up

  // Other exercises
  'shrugs': 'trmte8s', // band shrug
  'sled-push': 'yn2lLSI', // sled 45° leg press (closest)
  'butt-kicks': 'eL6Lz0v', // high knees (closest)
  'sprint-in-place': 'eL6Lz0v', // high knees
  'lateral-plank-walk': 'KhHJ338', // side plank
  'lateral-raise-water': 'AQ0mC4Y', // dumbbell lateral raise
  'doorframe-curl': '25GPyDY', // barbell curl
  'doorway-curl': '25GPyDY',
  'superman-pull': '4GqRrAk', // superman
  'reverse-snow-angel': 'XUUD0Fs', // rear delt row (closest)

  // Walking/running
  'walking': 'rjiM4L3', // walking on incline treadmill
  'jogging': 'rjiM4L3',
  'running': 'rjiM4L3'
}

/**
 * Find best matching exercise ID from database
 */
function findExerciseId(textId) {
  // Return if already valid 7-char ID
  if (/^[a-zA-Z0-9]{7}$/.test(textId)) {
    return textId
  }

  const normalized = textId.toLowerCase().trim()

  // Check manual mappings first
  if (manualMappings[normalized]) {
    const mapped = manualMappings[normalized]
    // If it's still text, try to find it
    if (!/^[a-zA-Z0-9]{7}$/.test(mapped)) {
      const found = exercisesByName.get(mapped.toLowerCase())
      if (found) return found
    } else {
      return mapped
    }
  }

  // Try exact name match
  const exactMatch = exercisesByName.get(normalized)
  if (exactMatch) return exactMatch

  // Try partial match by splitting words
  const words = normalized.split(/[\s-_]+/)

  // Try to find exercises that match all keywords
  const candidates = []
  for (const [name, id] of exercisesByName) {
    const allWordsMatch = words.every(word =>
      word.length > 2 && name.includes(word)
    )
    if (allWordsMatch) {
      candidates.push({ id, name, score: name.length }) // Prefer shorter names
    }
  }

  if (candidates.length > 0) {
    // Sort by score (prefer shorter, more exact matches)
    candidates.sort((a, b) => a.score - b.score)
    return candidates[0].id
  }

  // No match found
  console.warn(`⚠️  No match found for: "${textId}"`)
  return textId // Keep original
}

/**
 * Process a workout file and replace invalid IDs
 */
function processWorkoutFile(filePath) {
  console.log(`\n📝 Processing: ${path.basename(filePath)}`)

  let content = fs.readFileSync(filePath, 'utf-8')
  let replacements = 0

  // Find all exercisedb_id occurrences
  const regex = /exercisedb_id:\s*['"]([^'"]+)['"]/g
  let match
  const found = []

  while ((match = regex.exec(content)) !== null) {
    const currentId = match[1]
    if (!/^[a-zA-Z0-9]{7}$/.test(currentId)) {
      found.push(currentId)
    }
  }

  // Process each invalid ID
  const uniqueIds = [...new Set(found)]

  if (uniqueIds.length === 0) {
    console.log('  ✅ All IDs are valid')
    return 0
  }

  console.log(`  Found ${uniqueIds.length} invalid IDs:`)

  uniqueIds.forEach(oldId => {
    const newId = findExerciseId(oldId)
    if (newId !== oldId) {
      const oldPattern = new RegExp(`exercisedb_id:\\s*['"]${oldId}['"]`, 'g')
      content = content.replace(oldPattern, `exercisedb_id: '${newId}'`)
      console.log(`    ${oldId} → ${newId}`)
      replacements++
    } else {
      console.log(`    ${oldId} → ⚠️  NO MATCH`)
    }
  })

  // Write back
  if (replacements > 0) {
    fs.writeFileSync(filePath, content, 'utf-8')
    console.log(`  ✅ Replaced ${replacements} IDs`)
  }

  return replacements
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 Searching for workout files...\n')

  const workoutDir = path.join(__dirname, 'testograph-v2', 'lib', 'data')
  const files = fs.readdirSync(workoutDir)

  const workoutFiles = files.filter(f =>
    f.startsWith('mock-workouts-') && f.endsWith('.ts')
  )

  console.log(`Found ${workoutFiles.length} workout files\n`)

  let totalReplacements = 0

  workoutFiles.forEach(file => {
    const filePath = path.join(workoutDir, file)
    totalReplacements += processWorkoutFile(filePath)
  })

  console.log(`\n\n✅ DONE! Total replacements: ${totalReplacements}`)
}

main()
