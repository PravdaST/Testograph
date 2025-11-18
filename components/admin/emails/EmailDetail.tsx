'use client';

import { adminFetch } from '@/lib/admin/api';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Reply,
  Forward,
  Archive,
  Trash2,
  Star,
  MoreVertical,
  ArrowLeft,
  Send,
  X,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EmailDetailProps {
  emailId: string | null;
  onClose: () => void;
  showCompose?: boolean;
  onCloseCompose?: () => void;
}

interface EmailData {
  id: string;
  message_id: string;
  from_email: string;
  from_name?: string;
  to_email: string;
  to_name?: string;
  subject: string;
  body_text?: string;
  body_html?: string;
  received_at: string;
  is_read: boolean;
  is_starred: boolean;
  is_replied: boolean;
  attachments?: Array<{
    filename: string;
    contentType: string;
    size: number;
  }>;
}

export function EmailDetail({ emailId, onClose, showCompose = false, onCloseCompose }: EmailDetailProps) {
  const { toast } = useToast();
  const [email, setEmail] = useState<EmailData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Compose state
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeMessage, setComposeMessage] = useState('');

  useEffect(() => {
    if (emailId) {
      fetchEmailDetails();
    }
  }, [emailId]);

  const fetchEmailDetails = async () => {
    if (!emailId) return;

    setIsLoading(true);
    try {
      const response = await adminFetch(`/api/admin/email/${emailId}`);
      const data = await response.json();

      if (response.ok) {
        setEmail(data.email);
        // Mark as read
        if (!data.email.is_read) {
          await adminFetch(`/api/admin/email/${emailId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_read: true }),
          });
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: 'Error loading email',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStar = async () => {
    if (!email) return;

    try {
      await adminFetch(`/api/admin/email/${email.message_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_starred: !email.is_starred }),
      });

      setEmail({ ...email, is_starred: !email.is_starred });
    } catch (error) {
      console.error('Error toggling star:', error);
    }
  };

  const handleReply = async () => {
    if (!email || !replyMessage.trim()) return;

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
          title: 'Reply sent',
          description: 'Your reply has been sent successfully.',
        });
        setShowReply(false);
        setReplyMessage('');
        setEmail({ ...email, is_replied: true });
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: 'Error sending reply',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleComposeSend = async () => {
    if (!composeTo.trim() || !composeSubject.trim() || !composeMessage.trim()) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSending(true);
    try {
      const response = await adminFetch('/api/admin/email/send-smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: composeTo,
          subject: composeSubject,
          message: composeMessage,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Email sent',
          description: 'Your email has been sent successfully.',
        });
        setComposeTo('');
        setComposeSubject('');
        setComposeMessage('');
        onCloseCompose?.();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: 'Error sending email',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  // Compose mode
  if (showCompose) {
    return (
      <div className="flex-1 flex flex-col bg-background">
        {/* Header */}
        <div className="border-b p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">New Message</h2>
          <Button variant="ghost" size="sm" onClick={onCloseCompose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Compose Form */}
        <div className="flex-1 flex flex-col p-4 space-y-4 overflow-y-auto">
          <div>
            <label className="text-sm font-medium text-muted-foreground">To</label>
            <Input
              placeholder="recipient@example.com"
              value={composeTo}
              onChange={(e) => setComposeTo(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Subject</label>
            <Input
              placeholder="Email subject"
              value={composeSubject}
              onChange={(e) => setComposeSubject(e.target.value)}
            />
          </div>

          <div className="flex-1">
            <label className="text-sm font-medium text-muted-foreground">Message</label>
            <Textarea
              placeholder="Write your message..."
              value={composeMessage}
              onChange={(e) => setComposeMessage(e.target.value)}
              className="min-h-[300px] resize-none"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCloseCompose}>
              Cancel
            </Button>
            <Button onClick={handleComposeSend} disabled={isSending}>
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // No email selected
  if (!emailId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/10">
        <div className="text-center text-muted-foreground">
          <p>Select an email to view</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // No email found
  if (!email) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/10">
        <div className="text-center text-muted-foreground">
          <p>Email not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={toggleStar}>
              <Star
                className={`h-4 w-4 ${
                  email.is_starred ? 'fill-yellow-400 text-yellow-400' : ''
                }`}
              />
            </Button>
            <Button variant="ghost" size="sm">
              <Archive className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Subject */}
        <h1 className="text-2xl font-bold mb-4">{email.subject}</h1>

        {/* From/To Info */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium">
                  {(email.from_name || email.from_email).charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium">{email.from_name || email.from_email}</p>
                <p className="text-sm text-muted-foreground">{email.from_email}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground ml-12">
              to {email.to_name || email.to_email}
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm text-muted-foreground">
              {new Date(email.received_at).toLocaleString('bg-BG', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </p>
            {email.is_replied && (
              <Badge variant="outline" className="mt-1">
                Replied
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Email Body */}
      <div className="flex-1 overflow-y-auto p-6">
        {email.body_html ? (
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: email.body_html }}
          />
        ) : (
          <div className="whitespace-pre-wrap">{email.body_text}</div>
        )}

        {/* Attachments */}
        {email.attachments && email.attachments.length > 0 && (
          <>
            <Separator className="my-6" />
            <div>
              <h3 className="text-sm font-medium mb-3">
                Attachments ({email.attachments.length})
              </h3>
              <div className="space-y-2">
                {email.attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium">{attachment.filename}</p>
                      <p className="text-xs text-muted-foreground">
                        {(attachment.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div className="border-t p-4">
        {!showReply ? (
          <div className="flex gap-2">
            <Button onClick={() => setShowReply(true)} className="flex-1">
              <Reply className="h-4 w-4 mr-2" />
              Reply
            </Button>
            <Button variant="outline" className="flex-1">
              <Forward className="h-4 w-4 mr-2" />
              Forward
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Reply to {email.from_email}</p>
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
              placeholder="Write your reply..."
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              className="min-h-[150px] resize-none"
            />

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowReply(false);
                  setReplyMessage('');
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleReply} disabled={isSending}>
                {isSending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Reply
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
