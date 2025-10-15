'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Mail,
  MailOpen,
  RefreshCw,
  Search,
  Loader2,
  Star,
  Reply,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Email {
  id: string;
  message_id: string;
  subject: string;
  from_email: string;
  from_name?: string;
  to_email: string;
  body_text?: string;
  body_html?: string;
  received_at: string;
  is_read: boolean;
  is_starred: boolean;
  is_replied: boolean;
}

interface EmailInboxProps {
  onSelectEmail: (email: Email) => void;
}

export function EmailInbox({ onSelectEmail }: EmailInboxProps) {
  const { toast } = useToast();
  const [emails, setEmails] = useState<Email[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchEmails(false); // Load from cache initially
  }, []);

  const fetchEmails = async (refresh: boolean = false) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/email/inbox?refresh=${refresh}&limit=50`);
      const data = await response.json();

      if (response.ok) {
        setEmails(data.emails || []);
        if (refresh) {
          toast({
            title: 'Inbox обновен',
            description: `Заредени ${data.count} emails от ${data.source}`,
          });
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: 'Грешка',
        description: error.message || 'Неуспешно зареждане на inbox',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await fetch(`/api/admin/email/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_read: true }),
      });

      setEmails(emails.map(e =>
        e.message_id === messageId ? { ...e, is_read: true } : e
      ));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const toggleStar = async (messageId: string, currentState: boolean) => {
    try {
      await fetch(`/api/admin/email/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_starred: !currentState }),
      });

      setEmails(emails.map(e =>
        e.message_id === messageId ? { ...e, is_starred: !currentState } : e
      ));
    } catch (error) {
      console.error('Error toggling star:', error);
    }
  };

  const filteredEmails = emails.filter(email =>
    searchQuery === '' ||
    email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.from_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.from_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadCount = emails.filter(e => !e.is_read).length;

  return (
    <div className="space-y-4">
      {/* Header with stats and refresh */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <span className="font-semibold">
              Общо: {emails.length}
            </span>
          </div>
          {unreadCount > 0 && (
            <Badge variant="default" className="bg-blue-600">
              {unreadCount} непрочетени
            </Badge>
          )}
        </div>
        <Button
          onClick={() => fetchEmails(true)}
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Зареждане...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </>
          )}
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Търси emails по тема, подател..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Email list */}
      <div className="rounded-md border">
        {filteredEmails.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Mail className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>Няма намерени emails</p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredEmails.map((email) => (
              <div
                key={email.id}
                className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                  !email.is_read ? 'bg-blue-50/50' : ''
                }`}
                onClick={() => {
                  markAsRead(email.message_id);
                  onSelectEmail(email);
                }}
              >
                <div className="flex items-start gap-3">
                  {/* Read/Unread indicator */}
                  <div className="flex-shrink-0 mt-1">
                    {email.is_read ? (
                      <MailOpen className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Mail className="h-5 w-5 text-blue-600" />
                    )}
                  </div>

                  {/* Email content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate ${!email.is_read ? 'font-bold' : ''}`}>
                          {email.from_name || email.from_email}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {email.from_email}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {email.is_replied && (
                          <Badge variant="outline" className="text-xs">
                            <Reply className="h-3 w-3 mr-1" />
                            Отговорен
                          </Badge>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStar(email.message_id, email.is_starred);
                          }}
                          className="hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`h-4 w-4 ${
                              email.is_starred
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-muted-foreground'
                            }`}
                          />
                        </button>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(email.received_at).toLocaleDateString('bg-BG', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    <p className={`mt-1 truncate ${!email.is_read ? 'font-semibold' : ''}`}>
                      {email.subject}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground truncate">
                      {email.body_text?.substring(0, 100)}...
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
