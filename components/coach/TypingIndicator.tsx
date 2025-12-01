'use client'

import Image from 'next/image'

/**
 * Typing Indicator Component
 * Shows animated dots when AI is responding
 */

export function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-message-in">
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
        <Image
          src="/coach-avatar.png"
          alt="AI Coach"
          width={32}
          height={32}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Typing Bubble */}
      <div className="bg-muted rounded-2xl rounded-tl-md px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">пише</span>
          <div className="flex items-center gap-1">
            <span
              className="w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: '0ms', animationDuration: '0.6s' }}
            />
            <span
              className="w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: '150ms', animationDuration: '0.6s' }}
            />
            <span
              className="w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: '300ms', animationDuration: '0.6s' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
