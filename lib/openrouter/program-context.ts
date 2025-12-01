/**
 * Program Context Builder for AI Coach
 *
 * Simplified version - provides basic program context
 * without specific meal/workout data (to be enhanced later)
 */

export interface MealInfo {
  meal_number: number
  time: string
  name: string
  calories: number
  protein: number
  carbs: number
  fats: number
  ingredients: { name: string; quantity: string }[]
}

export interface ExerciseInfo {
  name_bg: string
  name_en: string
  sets: number
  reps: number | string
  rest_seconds: number
  notes?: string
}

export interface WorkoutInfo {
  name: string
  duration: number
  exercises: ExerciseInfo[]
}

export interface ProgramContext {
  todayMeals: MealInfo[]
  todayWorkout: WorkoutInfo | null
  dailyCalories: number
  dailyProtein: number
  dailyCarbs: number
  dailyFats: number
}

/**
 * Get today's day of week (1=Monday, 7=Sunday)
 */
function getTodayDayOfWeek(): number {
  const day = new Date().getDay()
  // Convert from Sunday=0 to Monday=1 format
  return day === 0 ? 7 : day
}

/**
 * Get full program context for today
 *
 * Note: This is a simplified version that returns placeholder data.
 * The AI Coach will work but won't have specific daily meal/workout information.
 */
export function getProgramContext(
  category: string,
  level: string,
  workoutLocation: 'home' | 'gym'
): ProgramContext {
  // Return placeholder context
  // The AI will still provide general advice based on the knowledge base
  return {
    todayMeals: [],
    todayWorkout: null,
    dailyCalories: 2000,
    dailyProtein: 150,
    dailyCarbs: 200,
    dailyFats: 70,
  }
}

/**
 * Build program context prompt for AI Coach
 */
export function buildProgramContextPrompt(context: ProgramContext): string {
  const dayNames = ['', 'Ponedelnik', 'Vtornik', 'Sryada', 'Chetvartuk', 'Petak', 'Sabota', 'Nedelya']
  const todayName = dayNames[getTodayDayOfWeek()]

  let prompt = `
===============================================
DNESHNA PROGRAMA NA POTREBITELYA (${todayName})
===============================================

Dnevni makrosi (priblizitelni):
- Kalorii: ${context.dailyCalories} kcal
- Protein: ${context.dailyProtein}g
- Vaglehidrati: ${context.dailyCarbs}g
- Maznini: ${context.dailyFats}g
`

  if (context.todayMeals.length > 0) {
    prompt += `
HRANITELEN PLAN ZA DNES:
`
    for (const meal of context.todayMeals) {
      const mealNames = ['', 'Zakuska', 'Mejdinna zakuska', 'Obqd', 'Sledobedna zakuska', 'Vecherya']
      prompt += `
${mealNames[meal.meal_number]} (${meal.time}): ${meal.name}
  - Kalorii: ${meal.calories} | P: ${meal.protein}g | V: ${meal.carbs}g | M: ${meal.fats}g
  - Sustavki: ${meal.ingredients.map(i => `${i.name} (${i.quantity})`).join(', ')}
`
    }
  }

  if (context.todayWorkout) {
    prompt += `
TRENIROVKA ZA DNES: ${context.todayWorkout.name} (${context.todayWorkout.duration} min)
`
    for (const ex of context.todayWorkout.exercises) {
      prompt += `
- ${ex.name_bg} (${ex.name_en})
  - ${ex.sets} serii x ${ex.reps} povtoreniya
  - Pochivka: ${ex.rest_seconds}s
  ${ex.notes ? `- Savet: ${ex.notes}` : ''}
`
    }
  } else {
    prompt += `
TRENIROVKA ZA DNES: Pochiven den (aktivno vazstanovyavane)
`
  }

  prompt += `
===============================================
VAJNO ZA OTGOVORITE:
1. Kogato potrebitelyat pita za hranata si - day obshti saveti za pravilno hranene
2. Kogato pita za trenirovkata - day obshti saveti za uprajneniya
3. Mojesh da davash alternativni (npr. zamestiteli za sustavki, alternativni uprajneniya)
4. Pomagay s tehnika na uprajneniyata i saveti za gotvene
===============================================
`

  return prompt
}
