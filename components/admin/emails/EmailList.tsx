'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  RefreshCw,
  Archive,
  Trash2,
  Mail,
  MailOpen,
  Star,
  Loader2,
} from 'lucide-react';
import type { EmailFolder } from '@/app/admin/emails/page';
import { useToast } from '@/hooks/use-toast';

interface EmailListProps {
  folder: EmailFolder;
  account: string;
  selectedEmailId: string | null;
  onEmailSelect: (id: string) => void;
}

interface Email {
  id: string;
  message_id: string;
  from_email: string;
  from_name?: string;
  subject: string;
  body_text?: string;
  received_at: string;
  is_read: boolean;
  is_starred: boolean;
  is_replied: boolean;
}

export function EmailList({
  folder,
  account,
  selectedEmailId,
  onEmailSelect,
}: EmailListProps) {
  const { toast } = useToast();
  const [emails, setEmails] = useState<Email[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchEmails();
  }, [folder, account]);

  const fetchEmails = async (refresh = false) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/email/inbox?refresh=${refresh}&limit=50`);
      const data = await response.json();

      if (response.ok) {
        setEmails(data.emails || []);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: 'Error loading emails',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
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

  const toggleEmailSelection = (id: string) => {
    const newSelection = new Set(selectedEmails);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedEmails(newSelection);
  };

  const selectAll = () => {
    if (selectedEmails.size === filteredEmails.length) {
      setSelectedEmails(new Set());
    } else {
      setSelectedEmails(new Set(filteredEmails.map(e => e.id)));
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
    <div className="flex-1 flex flex-col border-r bg-background">
      {/* Toolbar */}
      <div className="border-b p-3 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search emails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selectedEmails.size === filteredEmails.length && filteredEmails.length > 0}
              onCheckedChange={selectAll}
            />
            <Button variant="ghost" size="sm" onClick={() => fetchEmails(true)} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            {selectedEmails.size > 0 && (
              <>
                <Button variant="ghost" size="sm">
                  <Archive className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {unreadCount > 0 && `${unreadCount} unread • `}
            {emails.length} total
          </div>
        </div>
      </div>

      {/* Email List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && emails.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredEmails.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Mail className="h-12 w-12 mb-4 opacity-20" />
            <p>No emails found</p>
          </div>
        ) : (
          filteredEmails.map((email) => (
            <div
              key={email.id}
              onClick={() => onEmailSelect(email.message_id)}
              className={`border-b p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                selectedEmailId === email.message_id ? 'bg-muted' : ''
              } ${!email.is_read ? 'bg-blue-50/30' : ''}`}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={selectedEmails.has(email.id)}
                  onCheckedChange={() => toggleEmailSelection(email.id)}
                  onClick={(e) => e.stopPropagation()}
                />

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStar(email.message_id, email.is_starred);
                  }}
                  className="mt-1"
                >
                  <Star
                    className={`h-4 w-4 ${
                      email.is_starred
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className={`font-medium truncate ${!email.is_read ? 'font-bold' : ''}`}>
                      {email.from_name || email.from_email}
                    </p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {new Date(email.received_at).toLocaleDateString('bg-BG', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <p className={`text-sm truncate mb-1 ${!email.is_read ? 'font-semibold' : ''}`}>
                    {email.subject}
                  </p>

                  <p className="text-sm text-muted-foreground truncate">
                    {email.body_text?.substring(0, 100)}
                  </p>

                  {email.is_replied && (
                    <Badge variant="outline" className="mt-2 text-xs">
                      Replied
                    </Badge>
                  )}
                </div>

                {!email.is_read && (
                  <div className="w-2 h-2 rounded-full bg-blue-600 mt-2" />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
