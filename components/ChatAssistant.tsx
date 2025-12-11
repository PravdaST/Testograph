'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GlassCard } from '@/components/ui/glass-card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, X, User, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// Quick action suggestions
const QUICK_ACTIONS = [
  'Как да повиша тестостерона?',
  'Защо съм уморен?',
  'Какво да ям за либидо?',
  'Тренировки за тестостерон'
];

// Helper function to parse formatted messages
const parseFormattedMessage = (content: string) => {
  // Parse action buttons: [ACTION_BUTTON:Label:URL]
  const buttonRegex = /\[ACTION_BUTTON:([^:]+):([^\]]+)\]/g;
  const buttons: Array<{label: string, url: string}> = [];

  let cleanContent = content.replace(buttonRegex, (match, label, url) => {
    buttons.push({ label, url });
    return '';
  });

  // Parse bold text: **text** -> <strong>text</strong>
  cleanContent = cleanContent.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  return { content: cleanContent.trim(), buttons };
};

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isEmailSubmitted, setIsEmailSubmitted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({
        title: "Грешка",
        description: "Моля въведете валиден имейл адрес",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Check for existing messages in coach_messages (unified with App)
      const { data: existingMessages, error: messagesError } = await supabase
        .from('coach_messages')
        .select('*')
        .eq('email', email.trim().toLowerCase())
        .order('created_at', { ascending: true })
        .limit(20);

      if (messagesError) {
        console.error('Error loading messages:', messagesError);
        // Continue anyway - we'll start fresh
      }

      setIsEmailSubmitted(true);

      // Set messages (existing or welcome)
      if (existingMessages && existingMessages.length > 0) {
        const loadedMessages: Message[] = existingMessages.map(msg => ({
          id: msg.id,
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          timestamp: msg.created_at || new Date().toISOString()
        }));
        setMessages(loadedMessages);

        toast({
          title: "Добре дошли отново!",
          description: "Възстановихме вашия предишен разговор",
        });
      } else {
        const firstName = email.split('@')[0];
        const welcomeMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Здравей ${firstName}! Аз съм К. Богданов - твоят личен коуч по тестостерон и мъжко здраве.\n\nМога да ти помогна с:\n- Повишаване на тестостерона\n- Енергия и либидо\n- Хранене и тренировки\n- Сън и възстановяване\n\nКакво те интересува?`,
          timestamp: new Date().toISOString()
        };
        setMessages([welcomeMessage]);
      }

    } catch (error) {
      console.error('Error loading session:', error);
      toast({
        title: "Грешка",
        description: "Възникна проблем при зареждането",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (messageContent: string) => {
    if (isLoading || !messageContent.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Use unified App Coach API with streaming
      const response = await fetch('/api/coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageContent,
          email,
          source: 'website'
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let fullResponse = '';
      const assistantMessageId = (Date.now() + 1).toString();

      // Add placeholder message for streaming
      setMessages(prev => [...prev, {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString()
      }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                fullResponse += parsed.content;
                // Update message in real-time
                setMessages(prev => prev.map(msg =>
                  msg.id === assistantMessageId
                    ? { ...msg, content: fullResponse }
                    : msg
                ));
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      }

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Грешка",
        description: "Възникна проблем при изпращането на съобщението",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage(inputMessage);
  };

  const resetChat = () => {
    setIsEmailSubmitted(false);
    setEmail('');
    setMessages([]);
    setSessionId(null);
    setInputMessage('');
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 bg-primary hover:bg-primary/90 shadow-glow"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-80 sm:w-96 max-w-[calc(100vw-2rem)]">
      <GlassCard variant="elevated" className="max-h-[calc(100vh-6rem)] min-h-[400px] flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">К. Богданов</h3>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span>Тестостерон Коуч</span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          {!isEmailSubmitted ? (
            /* Email Input Form */
            <div className="p-4 sm:p-6 flex-1 flex flex-col justify-center min-h-[300px]">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h4 className="text-lg font-semibold mb-2">Безплатна консултация</h4>
                <p className="text-sm text-muted-foreground">
                  Задай въпрос на AI коуча по тестостерон и мъжко здраве
                </p>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">Твоят имейл</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="име@example.com"
                    required
                    className="mt-1"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Зареждане..." : "Започни чат"}
                </Button>
              </form>
            </div>
          ) : (
            /* Chat Interface */
            <>
              {/* Quick Actions (only show when no messages or first message) */}
              {messages.length <= 1 && (
                <div className="p-3 border-b border-white/10 flex-shrink-0">
                  <p className="text-xs text-muted-foreground mb-2">Популярни въпроси:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_ACTIONS.map((action, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-xs h-7"
                        onClick={() => sendMessage(action)}
                        disabled={isLoading}
                      >
                        {action}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages */}
              <ScrollArea className="flex-1 p-4 max-h-[350px] overflow-y-auto">
                <div className="space-y-4">
                  {messages.map((message) => {
                    const parsed = message.role === 'assistant'
                      ? parseFormattedMessage(message.content)
                      : { content: message.content, buttons: [] };

                    return (
                      <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] p-3 rounded-lg break-words ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {message.role === 'assistant' && parsed.content.includes('<strong>') ? (
                            <div
                              className="text-sm whitespace-pre-wrap break-words leading-relaxed"
                              dangerouslySetInnerHTML={{ __html: parsed.content }}
                            />
                          ) : (
                            <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                              {parsed.content}
                            </p>
                          )}

                          {/* Action buttons */}
                          {parsed.buttons.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {parsed.buttons.map((button, index) => (
                                <Button
                                  key={index}
                                  variant="outline"
                                  size="sm"
                                  className="text-xs bg-primary/10 hover:bg-primary/20 border-primary/30"
                                  onClick={() => window.open(button.url, '_blank')}
                                >
                                  {button.label}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted text-muted-foreground p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">К. Богданов пише</span>
                          <div className="flex space-x-1">
                            <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"></div>
                            <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                            <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-3 border-t border-white/10 flex-shrink-0">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Задай въпрос..."
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isLoading || !inputMessage.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetChat}
                  className="w-full mt-2 text-xs"
                >
                  Нов разговор
                </Button>
              </div>
            </>
          )}
        </div>
      </GlassCard>
    </div>
  );
};

export default ChatAssistant;
