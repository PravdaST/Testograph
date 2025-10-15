import Imap from 'imap';
import { simpleParser, ParsedMail } from 'mailparser';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

interface EmailConfig {
  user: string;
  password: string;
  host: string;
  port: number;
  tls: boolean;
}

interface FetchedEmail {
  id: string;
  messageId: string;
  subject: string;
  from: { email: string; name?: string };
  to: { email: string; name?: string }[];
  cc?: { email: string; name?: string }[];
  replyTo?: string;
  inReplyTo?: string;
  references?: string[];
  bodyText?: string;
  bodyHtml?: string;
  attachments: Array<{
    filename: string;
    contentType: string;
    size: number;
  }>;
  receivedAt: Date;
  isRead: boolean;
}

export class ImapClient {
  private config: EmailConfig;

  constructor() {
    this.config = {
      user: 'contact@testograph.eu',
      password: 'C0ntact1Test0!', // Use App Password if 2FA is enabled
      host: 'imap.gmail.com',
      port: 993,
      tls: true,
    };
  }

  /**
   * Fetch emails from IMAP inbox
   */
  async fetchInbox(limit: number = 50): Promise<FetchedEmail[]> {
    return new Promise((resolve, reject) => {
      const imap = new Imap({
        user: this.config.user,
        password: this.config.password,
        host: this.config.host,
        port: this.config.port,
        tls: this.config.tls,
        tlsOptions: { rejectUnauthorized: false },
      });

      const emails: FetchedEmail[] = [];

      imap.once('ready', () => {
        imap.openBox('INBOX', false, (err, box) => {
          if (err) {
            imap.end();
            return reject(err);
          }

          // Fetch last N messages
          const totalMessages = box.messages.total;
          if (totalMessages === 0) {
            imap.end();
            return resolve([]);
          }

          const start = Math.max(1, totalMessages - limit + 1);
          const end = totalMessages;

          const fetch = imap.seq.fetch(`${start}:${end}`, {
            bodies: '',
            struct: true,
          });

          fetch.on('message', (msg, seqno) => {
            msg.on('body', (stream) => {
              simpleParser(stream, async (err, parsed: ParsedMail) => {
                if (err) {
                  console.error('Error parsing email:', err);
                  return;
                }

                try {
                  const email: FetchedEmail = {
                    id: `${seqno}`,
                    messageId: parsed.messageId || `seq-${seqno}`,
                    subject: parsed.subject || '(No Subject)',
                    from: {
                      email: parsed.from?.value?.[0]?.address || 'unknown',
                      name: parsed.from?.value?.[0]?.name,
                    },
                    to: parsed.to?.value?.map((addr) => ({
                      email: addr.address || '',
                      name: addr.name,
                    })) || [],
                    cc: parsed.cc?.value?.map((addr) => ({
                      email: addr.address || '',
                      name: addr.name,
                    })),
                    replyTo: parsed.replyTo?.value?.[0]?.address,
                    inReplyTo: parsed.inReplyTo,
                    references: parsed.references,
                    bodyText: parsed.text,
                    bodyHtml: parsed.html || undefined,
                    attachments: parsed.attachments?.map((att) => ({
                      filename: att.filename || 'unnamed',
                      contentType: att.contentType,
                      size: att.size,
                    })) || [],
                    receivedAt: parsed.date || new Date(),
                    isRead: false, // Can be enhanced to check IMAP flags
                  };

                  emails.push(email);

                  // Cache to Supabase
                  await this.cacheEmail(email);
                } catch (error) {
                  console.error('Error processing email:', error);
                }
              });
            });
          });

          fetch.once('error', (err) => {
            console.error('Fetch error:', err);
            imap.end();
            reject(err);
          });

          fetch.once('end', () => {
            imap.end();
          });
        });
      });

      imap.once('error', (err) => {
        console.error('IMAP error:', err);
        reject(err);
      });

      imap.once('end', () => {
        resolve(emails);
      });

      imap.connect();
    });
  }

  /**
   * Cache email to Supabase for performance
   */
  private async cacheEmail(email: FetchedEmail): Promise<void> {
    try {
      const { error } = await supabase
        .from('received_emails_cache')
        .upsert({
          message_id: email.messageId,
          subject: email.subject,
          from_email: email.from.email,
          from_name: email.from.name || null,
          to_email: email.to[0]?.email || 'contact@testograph.eu',
          to_name: email.to[0]?.name || null,
          cc: email.cc?.map(c => c.email) || null,
          reply_to: email.replyTo || null,
          in_reply_to: email.inReplyTo || null,
          references: email.references || null,
          body_text: email.bodyText || null,
          body_html: email.bodyHtml || null,
          attachments: email.attachments,
          received_at: email.receivedAt.toISOString(),
          is_read: email.isRead,
        }, {
          onConflict: 'message_id',
        });

      if (error) {
        console.error('Error caching email:', error);
      }
    } catch (error) {
      console.error('Error in cacheEmail:', error);
    }
  }

  /**
   * Mark email as read
   */
  async markAsRead(messageId: string): Promise<void> {
    try {
      await supabase
        .from('received_emails_cache')
        .update({ is_read: true })
        .eq('message_id', messageId);
    } catch (error) {
      console.error('Error marking email as read:', error);
    }
  }

  /**
   * Get cached emails from Supabase (faster than IMAP)
   */
  async getCachedEmails(limit: number = 50): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('received_emails_cache')
        .select('*')
        .order('received_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching cached emails:', error);
      return [];
    }
  }
}
