import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const exercisesPath = path.join(__dirname, 'testograph-v2', 'lib', 'data', 'exercises.json')
const exercises = JSON.parse(fs.readFileSync(exercisesPath, 'utf-8'))

// Unmapped exercises to search for
const searchTerms = [
  'pike', 'push-up', 'pushup',
  'rowing', 'row machine',
  'assault', 'bike',
  'treadmill', 'sprint',
  'sled push',
  'foam roll',
  'stretch',
  'battle rope',
  'butt kick',
  'chair dip',
  'decline push',
  'face pull',
  'bulgarian',
  'nordic curl',
  'incline push',
  'wide grip pull',
  'rear delt',
  'shrug',
  'pec deck',
  'ab wheel',
  'diamond push',
  'handstand',
  'plank walk',
  'scapular',
  'chin-up',
  'glute bridge',
  'calf jump'
]

console.log('Searching exercises database...\n')

searchTerms.forEach(term => {
  const results = exercises.filter(ex =>
    ex.name.toLowerCase().includes(term.toLowerCase())
  ).slice(0, 3) // Top 3 matches

  if (results.length > 0) {
    console.log(`\n🔍 "${term}":`)
    results.forEach(ex => {
      console.log(`   ${ex.exerciseId} - ${ex.name}`)
    })
  }
})
