'use client'

/**
 * AI Coach Page
 * Personalized coaching chat interface
 */

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Home } from 'lucide-react'
import { ChatMessage } from '@/components/coach/ChatMessage'
import { ChatInput } from '@/components/coach/ChatInput'
import { QuickActions } from '@/components/coach/QuickActions'
import { TypingIndicator } from '@/components/coach/TypingIndicator'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
}

export default function CoachPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userProfilePicture, setUserProfilePicture] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load chat history on mount
  useEffect(() => {
    loadChatHistory()
    // Try to get profile picture from localStorage
    const storedProfilePic = localStorage.getItem('userProfilePicture')
    if (storedProfilePic) {
      setUserProfilePicture(storedProfilePic)
    }
  }, [])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadChatHistory = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/coach/history')

      if (!response.ok) {
        if (response.status === 401) {
          // Not logged in, redirect to login
          router.push('/login')
          return
        }
        throw new Error('Failed to load chat history')
      }

      const data = await response.json()
      setMessages(
        data.messages.map((msg: { id: string; role: string; content: string }) => ({
          id: msg.id,
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }))
      )
    } catch (err) {
      console.error('Failed to load chat history:', err)
      setError('Greshka pri zarezhdane na chata')
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async (content: string) => {
    if (isStreaming) return

    // Add user message immediately
    const userMessageId = `user-${Date.now()}`
    setMessages((prev) => [
      ...prev,
      { id: userMessageId, role: 'user', content },
    ])

    // Add placeholder for AI response
    const aiMessageId = `ai-${Date.now()}`
    setMessages((prev) => [
      ...prev,
      { id: aiMessageId, role: 'assistant', content: '', isStreaming: true },
    ])
    setIsStreaming(true)
    setError(null)

    try {
      const response = await fetch('/api/coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content }),
      })

      if (!response.ok) {
        if (response.status === 429) {
          const data = await response.json()
          throw new Error(`Tvarde mnogo zayavki. Izchakay ${data.resetIn || 60} sekundi.`)
        }
        throw new Error('Failed to send message')
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') continue

              try {
                const parsed = JSON.parse(data)
                if (parsed.content) {
                  fullContent += parsed.content
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === aiMessageId
                        ? { ...msg, content: fullContent, isStreaming: true }
                        : msg
                    )
                  )
                }
              } catch {
                // Ignore parse errors
              }
            }
          }
        }
      }

      // Mark streaming as complete
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId ? { ...msg, isStreaming: false } : msg
        )
      )
    } catch (err) {
      console.error('Failed to send message:', err)
      setError(err instanceof Error ? err.message : 'Greshka pri izprashtane')

      // Remove the placeholder AI message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== aiMessageId))
    } finally {
      setIsStreaming(false)
    }
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/30">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border">
          <div className="container mx-auto px-4 flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <img src="/coach-avatar.png" alt="K. Bogdanov" className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="font-semibold">K. Bogdanov</h1>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span>Endokrinolog</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading state */}
        <div className="container mx-auto px-4 py-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
              <div className="flex-1 h-16 rounded-2xl bg-muted animate-pulse" />
            </div>
          ))}
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/app')}
              className="p-2 -ml-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <img src="/coach-avatar.png" alt="K. Bogdanov" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="font-semibold">K. Bogdanov</h1>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span>Endokrinolog</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => router.push('/app')}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <Home className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="container mx-auto px-4 py-4">
        <QuickActions onSelect={sendMessage} disabled={isStreaming} />
      </div>

      {/* Messages */}
      <div className="container mx-auto px-4 pb-40 space-y-4">
        {messages.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto rounded-full overflow-hidden mb-4">
              <img src="/coach-avatar.png" alt="K. Bogdanov" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-lg font-semibold mb-2">Zdravey!</h2>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Az sam d-r Bogdanov, tvoyat lichen endokrinolog. Izberi tema ili zaday vapros.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            role={msg.role}
            content={msg.content}
            isStreaming={msg.isStreaming}
            userProfilePicture={userProfilePicture}
          />
        ))}

        {isStreaming && messages[messages.length - 1]?.content === '' && (
          <TypingIndicator />
        )}

        {error && (
          <div className="text-center py-4">
            <p className="text-sm text-destructive">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-xs text-primary mt-2"
            >
              Zatvori
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput
        onSend={sendMessage}
        disabled={isStreaming}
        placeholder="Popitay TestoKouch..."
      />
    </main>
  )
}
