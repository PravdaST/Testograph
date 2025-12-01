'use client'

/**
 * Chat Message Bubble Component
 * Displays user or AI assistant messages with appropriate styling
 * Parses [[ARTICLE:title|url]] format into clickable cards
 */

import Image from 'next/image'
import { cn } from '@/lib/utils'
import { User, ExternalLink, BookOpen, ShoppingCart } from 'lucide-react'

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
  userProfilePicture?: string | null
}

interface LinkItem {
  title: string
  url: string
  type: 'article' | 'shop'
}

/**
 * Parse content and extract links
 * Formats: [[ARTICLE:title|url]] and [[SHOP:title|url]]
 * Also handles fallback for markdown links [text](url) from testograph.eu
 */
function parseContent(content: string): { text: string; links: LinkItem[] } {
  const links: LinkItem[] = []
  let processedContent = content

  // 1. Extract [[ARTICLE:title|url]] format
  const articleRegex = /\[\[ARTICLE:([^|]+)\|([^\]]+)\]\]/g
  let match
  while ((match = articleRegex.exec(content)) !== null) {
    const url = match[2].trim()
    if (url.includes('testograph.eu/learn')) {
      links.push({
        title: match[1].trim(),
        url: url,
        type: 'article',
      })
    }
  }
  processedContent = processedContent.replace(articleRegex, '')

  // 2. Extract [[SHOP:title|url]] format
  const shopRegex = /\[\[SHOP:([^|]+)\|([^\]]+)\]\]/g
  while ((match = shopRegex.exec(content)) !== null) {
    const url = match[2].trim()
    if (url.includes('shop.testograph.eu') || url.includes('testograph.eu')) {
      links.push({
        title: match[1].trim(),
        url: url,
        type: 'shop',
      })
    }
  }
  processedContent = processedContent.replace(shopRegex, '')

  // 3. Fallback: Extract markdown links [text](url) for testograph.eu only
  const markdownLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^)]*testograph\.eu[^)]*)\)/g
  while ((match = markdownLinkRegex.exec(content)) !== null) {
    const title = match[1].trim()
    const url = match[2].trim()
    if (!links.some(l => l.url === url)) {
      const type = url.includes('shop.testograph.eu') ? 'shop' : 'article'
      links.push({ title, url, type })
    }
  }
  processedContent = processedContent.replace(markdownLinkRegex, '')

  // 4. Clean up any remaining broken/invalid links
  processedContent = processedContent.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')

  // 5. Clean up any raw URLs that might have leaked through
  processedContent = processedContent.replace(/https?:\/\/[^\s]+/g, '')

  // 6. Clean up markdown formatting that slipped through
  // Remove ** bold markers
  processedContent = processedContent.replace(/\*\*([^*]+)\*\*/g, '$1')
  // Remove * italic markers or list items
  processedContent = processedContent.replace(/^\*\s+/gm, '')
  processedContent = processedContent.replace(/\*([^*]+)\*/g, '$1')
  // Remove - list items at start of line
  processedContent = processedContent.replace(/^-\s+/gm, '')
  // Remove # headers
  processedContent = processedContent.replace(/^#+\s*/gm, '')
  // Remove bullet points
  processedContent = processedContent.replace(/^\s*/gm, '')

  // 7. Clean up extra whitespace and newlines
  processedContent = processedContent.replace(/\n{3,}/g, '\n\n').trim()

  return { text: processedContent, links }
}

/**
 * Link Card Component - handles both articles and shop links
 */
function LinkCard({ title, url, type }: LinkItem) {
  const isShop = type === 'shop'

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex items-center gap-3 p-3 mt-2 border rounded-xl transition-all duration-200 hover:shadow-md group",
        isShop
          ? "bg-primary/10 hover:bg-primary/20 border-primary/30"
          : "bg-background/80 hover:bg-background border-border"
      )}
    >
      <div className={cn(
        "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center",
        isShop ? "bg-primary/20" : "bg-primary/10"
      )}>
        {isShop ? (
          <ShoppingCart className="w-5 h-5 text-primary" />
        ) : (
          <BookOpen className="w-5 h-5 text-primary" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{title}</p>
        <p className="text-xs text-muted-foreground">
          {isShop ? 'shop.testograph.eu' : 'testograph.eu/learn'}
        </p>
      </div>
      <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
    </a>
  )
}

export function ChatMessage({ role, content, isStreaming, userProfilePicture }: ChatMessageProps) {
  const isUser = role === 'user'

  // Parse content for links (only for assistant messages)
  const { text, links } = isUser ? { text: content, links: [] } : parseContent(content)

  return (
    <div
      className={cn(
        'flex gap-3 animate-message-in',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center overflow-hidden',
          isUser ? 'bg-primary' : 'bg-gradient-to-br from-blue-500 to-purple-600'
        )}
      >
        {isUser ? (
          userProfilePicture ? (
            <Image
              src={userProfilePicture}
              alt="Profile"
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-4 h-4 text-primary-foreground" />
          )
        ) : (
          <Image
            src="/coach-avatar.png"
            alt="AI Coach"
            width={32}
            height={32}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Message Bubble */}
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-2.5',
          isUser
            ? 'bg-primary text-primary-foreground rounded-tr-md'
            : 'bg-muted rounded-tl-md'
        )}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {text}
          {isStreaming && (
            <span className="inline-block w-1.5 h-4 ml-0.5 bg-current animate-pulse" />
          )}
        </p>

        {/* Link Cards (Articles & Shop) */}
        {links.length > 0 && (
          <div className="mt-2 space-y-2">
            {links.map((link, index) => (
              <LinkCard key={index} {...link} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
