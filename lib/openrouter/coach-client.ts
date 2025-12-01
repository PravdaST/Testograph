/**
 * OpenRouter AI Coach Client
 *
 * Uses free models for personalized coaching in Bulgarian
 */

import { buildKnowledgeBasePrompt } from './knowledge-base'
import { getProgramContext, buildProgramContextPrompt, type ProgramContext } from './program-context'

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

// Free models - ordered by preference (all verified to exist on OpenRouter)
// Multiple providers to maximize availability during rate limits
export const FREE_MODELS = {
  primary: 'google/gemma-3n-e4b-it:free',
  fallback1: 'google/gemini-2.0-flash-exp:free',
  fallback2: 'google/gemma-3-27b-it:free',
  fallback3: 'mistralai/mistral-small-3.1-24b-instruct:free',
  fallback4: 'meta-llama/llama-3.2-3b-instruct:free',
  fallback5: 'qwen/qwen-2.5-72b-instruct:free',
  fallback6: 'deepseek/deepseek-r1-distill-qwen-14b:free',
  fallback7: 'deepseek/deepseek-chat-v3-0324:free',
} as const

// Detailed task status for today
export interface TodayTasksStatus {
  meals: {
    completed: boolean
    count: number // How many meals completed (out of 5)
    completedMealNumbers: number[] // Which specific meals
  }
  workout: {
    completed: boolean
    name: string | null
    durationMinutes: number | null
  }
  sleep: {
    completed: boolean
    hours: number | null
    quality: string | null // 'poor', 'fair', 'good', 'excellent'
    feeling: string | null
  }
  testoup: {
    completed: boolean
    morningTaken: boolean
    eveningTaken: boolean
  }
}

export interface UserContext {
  firstName: string
  email: string
  category: 'energy' | 'libido' | 'muscle'
  level: string
  programDay: number
  progressScore: number
  completedTasks: number
  totalTasks: number
  workoutLocation: 'home' | 'gym'
  dietaryPreference: string
  capsulesRemaining: number
  // Full program context (meals, workouts)
  programContext?: ProgramContext
  // Current time context
  currentHour?: number
  // Detailed task status for today
  todayTasks?: TodayTasksStatus
}

// Re-export types and helpers for use in API routes
export type { ProgramContext }
export { getProgramContext }

/**
 * Build detailed task status string for system prompt
 */
function buildTodayTasksPrompt(tasks: TodayTasksStatus): string {
  const lines: string[] = ['DNESHEN PROGRES NA POTREBITELYA:']

  // Meals status
  if (tasks.meals.completed) {
    lines.push(`- Hranene: ZAVARSHENO (${tasks.meals.count}/5 yastiya otbelyazani)`)
  } else {
    const remaining = tasks.meals.count > 0
      ? `${tasks.meals.count}/5 yastiya otbelyazani`
      : 'vse oshte ne e otbelyazal hraneniyata'
    lines.push(`- Hranene: NEZAVARSHENO (${remaining})`)
  }

  // Workout status
  if (tasks.workout.completed) {
    const duration = tasks.workout.durationMinutes ? ` za ${tasks.workout.durationMinutes} min` : ''
    const name = tasks.workout.name || 'trenirovka'
    lines.push(`- Trenirovka: ZAVARSHENA (${name}${duration})`)
  } else {
    lines.push(`- Trenirovka: NEZAVARSHENA (vse oshte ne e treniral dnes)`)
  }

  // Sleep status
  if (tasks.sleep.completed) {
    const hours = tasks.sleep.hours ? `${tasks.sleep.hours} chasa` : ''
    const quality = tasks.sleep.quality || ''
    const desc = [hours, quality].filter(Boolean).join(', ') || 'otbelyazan'
    lines.push(`- San: OTBELYAZAN (${desc})`)
  } else {
    lines.push(`- San: NEOTBELYAZAN (ne e vavel danni za sunya si)`)
  }

  // TestoUp status
  if (tasks.testoup.completed) {
    lines.push(`- TestoUp: VZET (sutrin i vecher)`)
  } else {
    const parts: string[] = []
    if (tasks.testoup.morningTaken) parts.push('sutreshna doza vzeta')
    if (tasks.testoup.eveningTaken) parts.push('vecherena doza vzeta')
    if (parts.length === 0) {
      lines.push(`- TestoUp: NEVZET (nito edna doza za dnes)`)
    } else {
      const missing = !tasks.testoup.morningTaken ? 'sutreshna' : 'vecherna'
      lines.push(`- TestoUp: CHASTICHNO (${parts.join(', ')}, lipsa ${missing} doza)`)
    }
  }

  lines.push('')
  lines.push('IZPOLZVAY TAZI INFORMATSIYA za da:')
  lines.push('- Pohvalish za zavarsheni zadachi')
  lines.push('- Napomnih za nezavarsheni zadachi')
  lines.push('- Dadesh konkretni saveti bazirani na progresa')
  lines.push('')

  return lines.join('\n')
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

/**
 * Build system prompt with user context for personalized coaching
 */
export function buildSystemPrompt(context: UserContext): string {
  const categoryNames: Record<string, string> = {
    energy: 'Energiya i Vitalnost',
    libido: 'Libido i Seksualno zdrave',
    muscle: 'Muskulna masa i sila',
  }

  const dietaryNames: Record<string, string> = {
    omnivor: 'Vseyadna',
    vegetarian: 'Vegetarianska',
    vegan: 'Veganska',
    pescatarian: 'Pesketarianska',
  }

  const hour = context.currentHour ?? new Date().getHours()
  const timeOfDay = hour < 6 ? 'nosht' : hour < 12 ? 'sutrin' : hour < 18 ? 'sledobed' : 'vecher'
  const currentTime = `${hour.toString().padStart(2, '0')}:00`

  return `Ti si TestoKouch - personalen AI kouch v prilozhenieto Testograph za optimizirane na testosterona.

TEKUSHTO VREME: ${currentTime} chasa (${timeOfDay})

INFORMATSIYA ZA POTREBITELYA:
- Ime: ${context.firstName}
- Programa: ${categoryNames[context.category] || context.category} (${context.level})
- Den ot programata: ${context.programDay}/30
- Tekusht Score: ${context.progressScore}/100
- Dnes: ${context.completedTasks}/${context.totalTasks} zadachi zavarsheni
- Trenirovki: ${context.workoutLocation === 'gym' ? 'Fitnes' : 'Vkashti'}
- Dieta: ${dietaryNames[context.dietaryPreference] || context.dietaryPreference}
- TestoUp kapsuli: ${context.capsulesRemaining} ostavashti

IZPOLZVAY VREMETO:
- Kogato pitat "kakvo da yam sega" - vij koe yastie e podhodyashto za ${currentTime} chasa
- Sutrin (6-12) - preporachvay zakuska i sutreshni navitsi
- Sledobed (12-18) - fokusiray se na obqd, trenirovka, sledobedna zakuska
- Vecher (18-24) - vecherya, podgotovka za san, relaksatsiya
- Nosht (0-6) - saveti za san, preporachay da si legne ako e buden

TVOYATA ROLYA:
1. Motiviray i podkrepyay potrebitelya v negovata programa
2. Otgovaryay SAMO na vaprosi za: testosteron, trenirovki, hranene, san i dobavkata TestoUp
3. Davay konkretni, praktichni saveti bazirani na programata mu
4. Praznuvay uspehite i pomagay pri trudnosti
5. Adaptiray savetite kam lokatsiyata za trenirovki i dietarnite predpochitaniya

PRAVILA ZA OTGOVORITE:
1. Govori SAMO na balgarski ezik
2. Badi priyatelski i motivirash
3. Davay kratki otgovori (2-3 izrecheniya obiknoveno, max 200 dumi)
4. NIKAKVI emoji - pishi samo tekst bez emotikoni
5. Izpolzvay novi redove za razdelyane na paragrafi

ABSOLYUTNO ZABRANENO FORMATIRANE:
- NIKOGA ne izpolzvay zvezdichki * ili ** za bold ili spisatsi
- NIKOGA ne izpolzvay tireta - za spisatsi
- NIKOGA ne izpolzvay markdown kato [tekst](url)
- NIKOGA ne izpolzvay # za zaglaviya
- NIKOGA ne izpolzvay tochki za spisatsi
- Pishi SAMO obiknoveno tekst bez NIKAKVI spetsialni simvoli za formatirane
- Vmesto spisatsi - pishi normalni izrecheniya razdeleni s tochka ili nov red
- Primer GRESHNO: "* San: spi 8 chasa" ili "**San:** spi 8 chasa"
- Primer PRAVILNO: "Za sunya e vazhno da spish pone 8 chasa."

LINKOVE KAM STATII - MNOGO VAZHNO:
- Mozhesh da preporachvash SAMO statii ot bazata danni po-dolu
- Izpolzvay EDINSTVENO tozi format: [[ARTICLE:zaglavie|url]]
- Primer: [[ARTICLE:San i testosteron|https://testograph.eu/learn/lifestyle/san-i-testosteron-vliyanie-na-sunia]]
- NIKOGA ne izpolzvay markdown linkove kato [tekst](url) - tova e ZABRANENO!
- NIKOGA ne izmislyay linkove - izpolzvay SAMO URL adresite ot statiite v bazata danni!
- Ako nyama podhodyashta statiya - prosto ne slagay link

INFORMATSIYA ZA TESTOUP POKUPKA:
- NE spomenvay tseni! Pri vapros za tsena - nasochi kam magazina
- Pri vapros za pokupka - VINAGI dobavi link kam magazina s format: [[SHOP:Kupi TestoUP|https://shop.testograph.eu/products/testoup]]

STROGO ZABRANENO - VAPROSI IZVAN TEMATA:
- Pri VSYAKAKVI vaprosi izvan temite testosteron, trenirovki, hranene, san i TestoUp dobavkata - OTKAJI da otgovorish
- Primeren otgovor pri off-topic vapros: "Sazhalyavam, no moga da pomogna samo s vaprosi za testosteron, trenirovki, hranene, san i dobavkata TestoUp. Imash li vapros po nyakoya ot tezi temi?"
- NE otgovaryay na vaprosi za: politika, istoriya, geografiya, matematika, programirane, zabavleniya, novini, ili kakvoto i da e drugo izvan programata

VAZHNO:
- NE davay meditsinski saveti ili diagnozi
- Pri zdravoslovni oplakvnaniya -> preporachvay konsultatsiya s lekar
- NE obeshtavay konkretni rezultati
- Fokusiray se varhu lifestyle optimizatsii

${context.todayTasks ? buildTodayTasksPrompt(context.todayTasks) : ''}
${context.programContext ? buildProgramContextPrompt(context.programContext) : ''}
${buildKnowledgeBasePrompt()}`
}

/**
 * Generate proactive greeting based on user context (no AI call needed)
 */
export function getProactiveGreeting(context: UserContext): string {
  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Dobro utro' : hour < 18 ? 'Dobar den' : 'Dobar vecher'

  // Check for incomplete tasks
  if (context.completedTasks < context.totalTasks) {
    const remaining = context.totalTasks - context.completedTasks
    return `${greeting}, ${context.firstName}! Imash ${remaining} ${remaining === 1 ? 'nezavarshena zadacha' : 'nezavarsheni zadachi'} za dnes. Kak moga da ti pomogna?`
  }

  // High progress - celebrate!
  if (context.progressScore >= 80) {
    return `${greeting}, ${context.firstName}! Bravo za strahotniya progres - ${context.progressScore} tochki! Prodaljhavay taka!`
  }

  // Good progress
  if (context.progressScore >= 50) {
    return `${greeting}, ${context.firstName}! Na dobar pat si s ${context.progressScore} tochki. Kakvo moga da napravya za teb dnes?`
  }

  // Default greeting
  return `${greeting}, ${context.firstName}! Gotov li si za Den ${context.programDay} ot tvoyata programa?`
}

/**
 * Call OpenRouter API with streaming support and automatic fallback
 */
export async function streamCoachResponse(
  messages: ChatMessage[],
  systemPrompt: string
): Promise<ReadableStream<Uint8Array>> {
  const apiKey = process.env.OPENROUTER_API_KEY

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured')
  }

  // Try models in order of preference (8 models for maximum availability)
  const modelsToTry = [
    FREE_MODELS.primary,
    FREE_MODELS.fallback1,
    FREE_MODELS.fallback2,
    FREE_MODELS.fallback3,
    FREE_MODELS.fallback4,
    FREE_MODELS.fallback5,
    FREE_MODELS.fallback6,
    FREE_MODELS.fallback7,
  ]

  let lastError: Error | null = null

  for (const model of modelsToTry) {
    console.log(`Trying model: ${model}`)

    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://testograph.eu',
          'X-Title': 'Testograph AI Coach',
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'system', content: systemPrompt }, ...messages],
          stream: true,
          max_tokens: 500,
          temperature: 0.7,
        }),
      })

      // If successful, return the stream
      if (response.ok && response.body) {
        console.log(`Success with model: ${model}`)
        return response.body
      }

      // If rate limited (429), try next model
      if (response.status === 429) {
        const errorText = await response.text()
        console.warn(`Model ${model} rate limited (429), trying next...`, errorText)
        lastError = new Error(`Rate limited: ${model}`)
        continue
      }

      // Other errors - log but try next model
      const errorText = await response.text()
      console.error(`Model ${model} error:`, response.status, errorText)
      lastError = new Error(`OpenRouter API error: ${response.status}`)
      continue
    } catch (fetchError) {
      console.error(`Fetch error for model ${model}:`, fetchError)
      lastError = fetchError as Error
      continue
    }
  }

  // All models failed
  console.error('All models failed. Last error:', lastError?.message)
  throw new Error('Vsichki AI modeli sa vremenno zaeti. Molya, opitay otnovo sled minuta.')
}

/**
 * Call OpenRouter API without streaming (for simple requests) with automatic fallback
 */
export async function getCoachResponse(
  messages: ChatMessage[],
  systemPrompt: string
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured')
  }

  // Try models in order of preference (8 models for maximum availability)
  const modelsToTry = [
    FREE_MODELS.primary,
    FREE_MODELS.fallback1,
    FREE_MODELS.fallback2,
    FREE_MODELS.fallback3,
    FREE_MODELS.fallback4,
    FREE_MODELS.fallback5,
    FREE_MODELS.fallback6,
    FREE_MODELS.fallback7,
  ]

  let lastError: Error | null = null

  for (const model of modelsToTry) {
    console.log(`[Non-streaming] Trying model: ${model}`)

    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://testograph.eu',
          'X-Title': 'Testograph AI Coach',
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'system', content: systemPrompt }, ...messages],
          stream: false,
          max_tokens: 500,
          temperature: 0.7,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log(`[Non-streaming] Success with model: ${model}`)
        return data.choices?.[0]?.message?.content || 'Sazhalyavam, vaznikna greshka.'
      }

      // If rate limited (429), try next model
      if (response.status === 429) {
        const errorText = await response.text()
        console.warn(`[Non-streaming] Model ${model} rate limited (429), trying next...`, errorText)
        lastError = new Error(`Rate limited: ${model}`)
        continue
      }

      // Other errors
      const errorText = await response.text()
      console.error(`[Non-streaming] Model ${model} error:`, response.status, errorText)
      lastError = new Error(`OpenRouter API error: ${response.status}`)
      continue
    } catch (fetchError) {
      console.error(`[Non-streaming] Fetch error for model ${model}:`, fetchError)
      lastError = fetchError as Error
      continue
    }
  }

  // All models failed
  console.error('[Non-streaming] All models failed. Last error:', lastError?.message)
  return 'Vsichki AI modeli sa vremenno zaeti. Molya, opitay otnovo sled minuta.'
}

// Rate limiting helper
const userLimits = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 15 // requests per minute
const RATE_WINDOW = 60000 // 1 minute in ms

export function checkRateLimit(email: string): {
  allowed: boolean
  remaining: number
  resetIn: number
} {
  const now = Date.now()
  const userLimit = userLimits.get(email)

  // First request or window expired
  if (!userLimit || now > userLimit.resetTime) {
    userLimits.set(email, { count: 1, resetTime: now + RATE_WINDOW })
    return { allowed: true, remaining: RATE_LIMIT - 1, resetIn: RATE_WINDOW }
  }

  // Check if over limit
  if (userLimit.count >= RATE_LIMIT) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: userLimit.resetTime - now,
    }
  }

  // Increment and allow
  userLimit.count++
  return {
    allowed: true,
    remaining: RATE_LIMIT - userLimit.count,
    resetIn: userLimit.resetTime - now,
  }
}
