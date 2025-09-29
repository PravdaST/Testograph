import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GlassCard } from '@/components/ui/glass-card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Upload, Send, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isEmailSubmitted, setIsEmailSubmitted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUploaded, setPdfUploaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({
        title: "Грешка",
        description: "Моля въведете валиден имейл адрес",
        variant: "destructive",
      });
      return;
    }
    setIsEmailSubmitted(true);
    
    // Add welcome message
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: 'Здравейте! Аз съм Д-р Т.Богданов, ваш виртуален AI консултант по хормонално здраве. Моля качете вашия PDF файл с резултати от Testograph анализ, за да мога да ви предоставя персонализирани съвети.',
      timestamp: new Date().toISOString()
    };
    setMessages([welcomeMessage]);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: "Грешка",
        description: "Моля качете PDF файл",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "Грешка",
        description: "Файлът е твърде голям. Максимален размер: 10MB",
        variant: "destructive",
      });
      return;
    }

    setPdfFile(file);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('pdf', file);
      formData.append('email', email);
      if (sessionId) {
        formData.append('sessionId', sessionId);
      }

      const { data, error } = await supabase.functions.invoke('process-pdf', {
        body: formData,
      });

      if (error) throw error;

      setPdfUploaded(true);
      toast({
        title: "Успех",
        description: `PDF файлът "${file.name}" беше качен успешно`,
      });

      // Add confirmation message
      const confirmMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Отлично! Качих вашия PDF файл "${file.name}". Сега мога да отговарям на въпроси базирани на вашите резултати. Какво искате да разберете за вашите хормонални нива?`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, confirmMessage]);

    } catch (error) {
      console.error('Error uploading PDF:', error);
      toast({
        title: "Грешка",
        description: "Възникна проблем при качването на файла",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat-assistant', {
        body: {
          message: inputMessage,
          email,
          sessionId,
          pdfContent: pdfUploaded ? `PDF файл "${pdfFile?.name}" е качен и достъпен за анализ.` : null
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
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

  const resetChat = () => {
    setIsEmailSubmitted(false);
    setEmail('');
    setMessages([]);
    setSessionId(null);
    setPdfFile(null);
    setPdfUploaded(false);
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
    <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px]">
      <GlassCard variant="elevated" className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div>
            <h3 className="font-semibold text-foreground">Д-р Т.Богданов</h3>
            <p className="text-sm text-muted-foreground">AI Хормонален Експерт</p>
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
            <div className="p-6 flex-1 flex flex-col justify-center">
              <div className="text-center mb-6">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h4 className="text-lg font-semibold mb-2">Започнете разговор</h4>
                <p className="text-sm text-muted-foreground">
                  Въведете вашия имейл за да започнете консултация с AI хормонален експерт
                </p>
              </div>
              
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">Имейл адрес</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="вашия@имейл.com"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Започни разговор
                </Button>
              </form>
            </div>
          ) : (
            /* Chat Interface */
            <>
              {/* File Upload Section */}
              {!pdfUploaded && (
                <div className="p-4 border-b border-white/10">
                  <Label className="text-sm text-muted-foreground mb-2 block">
                    Качете вашия PDF с резултати от Testograph
                  </Label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {pdfFile ? pdfFile.name : 'Изберете PDF файл'}
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              )}

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted text-muted-foreground p-3 rounded-lg">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t border-white/10">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Напишете вашия въпрос..."
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