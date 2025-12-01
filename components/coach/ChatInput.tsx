'use client'

/**
 * Chat Input Component
 * Optimized text input with send button for chat messages
 */

import { useState, useRef, useCallback, memo } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

export const ChatInput = memo(function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'Попитай ТестоКоуч...',
}: ChatInputProps) {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Optimized auto-resize with useCallback
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setInput(value)

    // Auto-resize inline (faster than useEffect)
    const textarea = e.target
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
  }, [])

  // Memoized submit handler
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    const trimmedInput = input.trim()
    if (trimmedInput && !disabled) {
      onSend(trimmedInput)
      setInput('')
      // Reset height
      if (inputRef.current) {
        inputRef.current.style.height = 'auto'
      }
    }
  }, [input, disabled, onSend])

  // Memoized keydown handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const trimmedInput = input.trim()
      if (trimmedInput && !disabled) {
        onSend(trimmedInput)
        setInput('')
        if (inputRef.current) {
          inputRef.current.style.height = 'auto'
        }
      }
    }
  }, [input, disabled, onSend])

  const canSend = input.trim().length > 0 && !disabled

  return (
    <div className="fixed bottom-16 left-0 right-0 z-40 bg-background/95 backdrop-blur-lg border-t border-border safe-area-inset-bottom">
      <form onSubmit={handleSubmit} className="container-mobile py-3">
        <div className="flex items-center gap-3">
          {/* Input Container */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className={cn(
                'w-full resize-none rounded-2xl border-2 bg-muted/50 px-4 py-3',
                'text-sm placeholder:text-muted-foreground/70',
                'focus:outline-none focus:bg-background focus:border-primary/30',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'max-h-[120px] overflow-y-auto transition-all duration-200',
                canSend ? 'border-primary/20' : 'border-transparent'
              )}
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!canSend}
            className={cn(
              'flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center',
              'transition-all duration-200',
              canSend
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-105 active:scale-95'
                : 'bg-muted text-muted-foreground',
              'disabled:hover:scale-100'
            )}
          >
            {disabled ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className={cn(
                'w-5 h-5 transition-transform duration-200',
                canSend ? '-rotate-45' : 'rotate-0'
              )} />
            )}
          </button>
        </div>
      </form>
    </div>
  )
})
