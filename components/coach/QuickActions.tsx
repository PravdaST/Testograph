'use client'

/**
 * Quick Actions Component
 * Horizontal scroll chips for common coaching topics
 */

import { Utensils, Dumbbell, Moon, Pill, Sparkles, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuickAction {
  id: string
  label: string
  prompt: string
  icon: React.ElementType
  color: string
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'meal-now',
    label: 'Какво да ям?',
    prompt: 'Какво трябва да ям сега според плана ми?',
    icon: Utensils,
    color: 'bg-orange-500/10 text-orange-600 border-orange-500/30 dark:text-orange-400',
  },
  {
    id: 'workout',
    label: 'Тренировка',
    prompt: 'Каква е тренировката ми за днес? Обясни упражненията.',
    icon: Dumbbell,
    color: 'bg-blue-500/10 text-blue-600 border-blue-500/30 dark:text-blue-400',
  },
  {
    id: 'progress',
    label: 'Прогрес',
    prompt: 'Как се справям с програмата? Дай ми feedback.',
    icon: TrendingUp,
    color: 'bg-green-500/10 text-green-600 border-green-500/30 dark:text-green-400',
  },
  {
    id: 'sleep',
    label: 'Сън',
    prompt: 'Дай ми съвети за по-качествен сън тази вечер.',
    icon: Moon,
    color: 'bg-purple-500/10 text-purple-600 border-purple-500/30 dark:text-purple-400',
  },
  {
    id: 'supplements',
    label: 'TestoUp',
    prompt: 'Кога и как да взема TestoUp за най-добър ефект?',
    icon: Pill,
    color: 'bg-primary/10 text-primary border-primary/30',
  },
  {
    id: 'motivation',
    label: 'Мотивация',
    prompt: 'Дай ми мотивация да продължа с програмата!',
    icon: Sparkles,
    color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30 dark:text-yellow-400',
  },
]

interface QuickActionsProps {
  onSelect: (prompt: string) => void
  disabled?: boolean
}

export function QuickActions({ onSelect, disabled }: QuickActionsProps) {
  return (
    <div className="overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
      <div className="flex gap-2">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.id}
              onClick={() => onSelect(action.prompt)}
              disabled={disabled}
              className={cn(
                'flex-shrink-0 flex items-center gap-2 px-4 py-2.5',
                'rounded-full border transition-all',
                'hover:scale-105 active:scale-95',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
                action.color
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium whitespace-nowrap">
                {action.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
