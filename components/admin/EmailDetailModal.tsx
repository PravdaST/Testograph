'use client';

import { adminFetch } from '@/lib/admin/api';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  X,
  Reply,
  Star,
  Loader2,
  Mail,
  Calendar,
  User,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

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

interface EmailDetailModalProps {
  email: Email | null;
  isOpen: boolean;
  onClose: () => void;
  onReplySuccess?: () => void;
}

export function EmailDetailModal({
  email,
  isOpen,
  onClose,
  onReplySuccess,
}: EmailDetailModalProps) {
  const { toast } = useToast();
  const [showReply, setShowReply] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  if (!email) return null;

  const handleReply = async () => {
    if (!replyMessage.trim()) {
      toast({
        title: 'Грешка',
        description: 'Моля напишете съобщение',
        variant: 'destructive',
      });
      return;
    }

    setIsSending(true);
    try {
      const response = await adminFetch('/api/admin/email/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId: email.message_id,
          to: email.from_email,
          subject: email.subject,
          message: replyMessage,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Успех!',
          description: 'Reply изпратен успешно',
        });
        setReplyMessage('');
        setShowReply(false);
        if (onReplySuccess) onReplySuccess();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: 'Грешка',
        description: error.message || 'Неуспешно изпращане на reply',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-2xl pr-8">{email.subject}</DialogTitle>
              <DialogDescription className="mt-2 space-y-1">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>
                    <strong>{email.from_name || email.from_email}</strong>
                    {email.from_name && (
                      <span className="text-muted-foreground ml-2">{`<${email.from_email}>`}</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>До: {email.to_email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(email.received_at).toLocaleString('bg-BG', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>
              </DialogDescription>
            </div>
            {email.is_replied && (
              <Badge variant="outline" className="flex-shrink-0">
                <Reply className="h-3 w-3 mr-1" />
                Отговорен
              </Badge>
            )}
          </div>
        </DialogHeader>

        {/* Email Body */}
        <div className="mt-6 space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            {email.body_html ? (
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: email.body_html }}
              />
            ) : (
              <div className="whitespace-pre-wrap text-sm">{email.body_text}</div>
            )}
          </div>

          {/* Reply Section */}
          {!showReply ? (
            <Button onClick={() => setShowReply(true)} className="w-full">
              <Reply className="h-4 w-4 mr-2" />
              Отговори
            </Button>
          ) : (
            <div className="space-y-3 p-4 border-2 border-primary/30 rounded-lg">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Отговор</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowReply(false);
                    setReplyMessage('');
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <Textarea
                placeholder="Напишете вашия отговор..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                rows={8}
                className="resize-none"
              />

              <div className="flex gap-2">
                <Button
                  onClick={handleReply}
                  disabled={isSending || !replyMessage.trim()}
                  className="flex-1"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Изпращане...
                    </>
                  ) : (
                    <>
                      <Reply className="h-4 w-4 mr-2" />
                      Изпрати отговор
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowReply(false);
                    setReplyMessage('');
                  }}
                >
                  Отказ
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
