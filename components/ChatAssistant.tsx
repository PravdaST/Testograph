import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GlassCard } from '@/components/ui/glass-card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MessageCircle, Upload, Send, X, CheckCircle, FileText, AlertCircle, ExternalLink, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import TForecastFormMultiStep from './TForecastFormMultiStep';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

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
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUploaded, setPdfUploaded] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
      // Check for existing session or create new one
      const { data: existingSessions, error: sessionError } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('email', email.trim())
        .order('created_at', { ascending: false })
        .limit(1);

      if (sessionError) throw sessionError;

      let currentSession;
      let existingMessages: Message[] = [];

      if (existingSessions && existingSessions.length > 0) {
        // Use existing session
        currentSession = existingSessions[0];
        setSessionId(currentSession.id);

        // Load existing messages
        const { data: messages, error: messagesError } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('session_id', currentSession.id)
          .order('created_at', { ascending: true });

        if (messagesError) throw messagesError;

        existingMessages = messages?.map(msg => ({
          id: msg.id,
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          timestamp: msg.created_at || new Date().toISOString()
        })) || [];

        toast({
          title: "Добре дошли отново!",
          description: "Възстановихме вашия предишен разговор",
        });
      } else {
        // Create new session
        const { data: newSession, error: newSessionError } = await supabase
          .from('chat_sessions')
          .insert({ email })
          .select()
          .single();

        if (newSessionError) throw newSessionError;

        currentSession = newSession;
        setSessionId(newSession.id);

        toast({
          title: "Успех",
          description: "Създадохме нова сесия за вас",
        });
      }

      setIsEmailSubmitted(true);

      // Check if PDF was uploaded for existing session
      if (currentSession.pdf_filename && currentSession.pdf_url) {
        setPdfUploaded(true);
        // Create a fake File object with the filename for display purposes
        const fakeFile = new File([], currentSession.pdf_filename, { type: 'application/pdf' });
        setPdfFile(fakeFile);

        toast({
          title: "PDF файл възстановен",
          description: `Файл "${currentSession.pdf_filename}" е готов за анализ`,
        });
      }

      // Set messages (existing or welcome)
      if (existingMessages.length > 0) {
        setMessages(existingMessages);
      } else {
        const welcomeMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Здравейте! Аз съм Т.Богданов, ваш виртуален AI консултант по хормонално здраве. Моля качете вашия PDF файл с резултати от Testograph анализ, за да мога да ви предоставя персонализирани съвети.',
          timestamp: new Date().toISOString()
        };
        setMessages([welcomeMessage]);

        // Save welcome message to database
        await supabase
          .from('chat_messages')
          .insert({
            session_id: currentSession.id,
            role: 'assistant',
            content: welcomeMessage.content
          });
      }

    } catch (error) {
      console.error('Error creating/loading session:', error);
      toast({
        title: "Грешка",
        description: "Възникна проблем при създаването на сесията",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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

      // Add confirmation message with personalized greeting
      const confirmMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `✅ Перфектно! Успешно анализирах вашия PDF файл "${file.name}".

🔬 Вече имам достъп до вашите лабораторни резултати и мога да ви дам персонализирани съвети.

Започвам с бърз преглед на данните ви сега - след малко ще ви дам първоначалните ми забележки. Или ако имате конкретен въпрос, смело попитайте!`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, confirmMessage]);

      // Automatically trigger initial analysis after a short delay
      setTimeout(async () => {
        try {
          await sendMessage("Дай ми кратък преглед на моите резултати и първоначален съвет", false);
        } catch (error) {
          console.error('Error sending initial analysis:', error);
        }
      }, 1500);

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

  // Helper function to send a message programmatically
  const sendMessage = async (messageContent: string, addUserMessage: boolean = true) => {
    if (isLoading) return;

    if (addUserMessage) {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: messageContent,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMessage]);
    }

    setIsLoading(true);

    try {
      // Get current session data to check PDF status
      let currentPdfContent = null;
      if (sessionId) {
        const { data: sessionData, error: sessionError } = await supabase
          .from('chat_sessions')
          .select('pdf_filename, pdf_url')
          .eq('id', sessionId)
          .single();

        if (sessionData && sessionData.pdf_filename && sessionData.pdf_url) {
          currentPdfContent = `PDF файл "${sessionData.pdf_filename}" е качен и достъпен за анализ. URL: ${sessionData.pdf_url}`;
        }
      }

      const { data, error } = await supabase.functions.invoke('chat-assistant', {
        body: {
          message: messageContent,
          email,
          sessionId,
          pdfContent: currentPdfContent
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    await sendMessage(inputMessage, true);
    setInputMessage('');
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
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-80 sm:w-96 max-w-[calc(100vw-2rem)]">
      <GlassCard variant="elevated" className="max-h-[calc(100vh-6rem)] min-h-[400px] flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Т.Богданов</h3>
              <p className="text-sm text-muted-foreground">Хормонален Експерт</p>
              {isEmailSubmitted && (
                <div className="flex items-center gap-2 mt-1">
                  {pdfUploaded ? (
                    <div className="flex items-center gap-1 text-xs text-[#499167]">
                      <CheckCircle className="w-3 h-3" />
                      <span>PDF файл качен</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-xs text-amber-600">
                      <AlertCircle className="w-3 h-3" />
                      <span>Няма качен PDF файл</span>
                    </div>
                  )}
                </div>
              )}
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
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Създавам сесия..." : "Започни разговор"}
                </Button>
              </form>
            </div>
          ) : (
            /* Chat Interface */
            <>
              {/* File Upload Section */}
              <div className="p-3 border-b border-white/10 flex-shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm text-muted-foreground">
                    PDF анализ от Testograph
                  </Label>
                  {pdfUploaded && (
                    <div className="flex items-center gap-1 text-xs text-[#499167]">
                      <FileText className="w-3 h-3" />
                      <span>Качен</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={pdfUploaded ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className={`flex-1 text-xs ${!pdfUploaded ? 'animate-pulse border-2 border-purple-500/60 shadow-lg shadow-purple-500/30' : ''}`}
                  >
                    {pdfUploaded ? (
                      <>
                        <FileText className="w-3 h-3 mr-1" />
                        {pdfFile ? (pdfFile.name.length > 18 ? pdfFile.name.substring(0, 18) + '...' : pdfFile.name) : 'PDF файл'}
                      </>
                    ) : (
                      <>
                        <Upload className="w-3 h-3 mr-1" />
                        Качи PDF файл
                      </>
                    )}
                  </Button>
                  {pdfUploaded && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        try {
                          // Remove PDF info from database
                          if (sessionId) {
                            await supabase
                              .from('chat_sessions')
                              .update({
                                pdf_url: null,
                                pdf_filename: null
                              })
                              .eq('id', sessionId);
                          }

                          setPdfUploaded(false);
                          setPdfFile(null);
                          toast({
                            title: "PDF файлът беше премахнат",
                            description: "Можете да качите нов файл",
                          });
                        } catch (error) {
                          console.error('Error removing PDF:', error);
                          toast({
                            title: "Грешка",
                            description: "Възникна проблем при премахването на файла",
                            variant: "destructive",
                          });
                        }
                      }}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>

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
                                  onClick={() => {
                                    // Special handling for #open-quiz-form
                                    if (button.url === '#open-quiz-form') {
                                      setFormModalOpen(true);
                                    } else {
                                      window.open(button.url, '_blank');
                                    }
                                  }}
                                >
                                  {button.url === '#open-quiz-form' ? (
                                    <FileText className="w-3 h-3 mr-1" />
                                  ) : (
                                    <ExternalLink className="w-3 h-3 mr-1" />
                                  )}
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
                          <span className="text-sm">Т.Богданов пише</span>
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

      {/* Quiz Form Modal */}
      <Dialog open={formModalOpen} onOpenChange={setFormModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              Безплатен тестостерон анализ - 4 въпроса
            </DialogTitle>
          </DialogHeader>
          <TForecastFormMultiStep
            onResult={(result) => {
              // Close the modal
              setFormModalOpen(false);

              // Show success toast
              toast({
                title: "Анализът завърши успешно!",
                description: "Вашата Testograph прогноза беше изпратена на вашия имейл.",
              });

              // Add a message to the chat
              const resultMessage: Message = {
                id: Date.now().toString(),
                role: 'assistant',
                content: `✅ Успешно попълнихте анализа! Вашата Testograph прогноза беше изпратена на вашия имейл.\n\nСега можете да качите PDF файла, който получихте, за да продължим с персонализираната консултация.`,
                timestamp: new Date().toISOString()
              };
              setMessages(prev => [...prev, resultMessage]);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatAssistant;
