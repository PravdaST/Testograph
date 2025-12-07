'use client'

import dynamic from 'next/dynamic'

const ChatAssistant = dynamic(() => import('./ChatAssistant'), {
  ssr: false,
  loading: () => null,
})

export function ChatBubble() {
  return <ChatAssistant />
}
