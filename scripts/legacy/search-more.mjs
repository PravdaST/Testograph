import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const exercisesPath = path.join(__dirname, 'testograph-v2', 'lib', 'data', 'exercises.json')
const exercises = JSON.parse(fs.readFileSync(exercisesPath, 'utf-8'))

const searches = [
  'foam roll',
  'battle rope',
  'butt kick',
  'chair dip',
  'face pull',
  'bulgarian',
  'nordic',
  'pec deck',
  'ab wheel',
  'lateral plank',
  'lateral raise',
  'lunge jump',
  'calf',
  'yoga',
  'rowing',
  'assault',
  'sled'
]

searches.forEach(term => {
  const results = exercises.filter(ex =>
    ex.name.toLowerCase().includes(term.toLowerCase())
  ).slice(0, 3)

  if (results.length > 0) {
    console.log(`\n"${term}":`)
    results.forEach(ex => {
      console.log(`   ${ex.exerciseId} - ${ex.name}`)
    })
  } else {
    console.log(`\n"${term}": ⚠️  NO RESULTS`)
  }
})
