export interface SendEmailParams {
  from: string;
  fromName?: string;
  to: { email: string; name?: string }[];
  cc?: { email: string; name?: string }[];
  bcc?: { email: string; name?: string }[];
  subject: string;
  bodyHtml: string;
  bodyText?: string;
  replyTo?: string;
  inReplyTo?: string;
  references?: string[];
  attachments?: { filename: string; content: Buffer; contentType?: string }[];
}

export interface SendResult {
  messageId: string;
  providerMessageId?: string;
  threadId?: string;
}

export interface FetchOptions {
  syncToken?: string;
  maxResults?: number;
  since?: Date;
}

export interface FetchedEmail {
  providerMessageId: string;
  providerThreadId?: string;
  internetMessageId?: string;
  from: { email: string; name?: string };
  to: { email: string; name?: string }[];
  cc?: { email: string; name?: string }[];
  subject: string;
  bodyHtml?: string;
  bodyText?: string;
  snippet?: string;
  date: Date;
  inReplyTo?: string;
  references?: string[];
  labels?: string[];
  isRead?: boolean;
  attachments?: { fileName: string; mimeType?: string; size?: number; attachmentId?: string }[];
}

export interface FetchResult {
  emails: FetchedEmail[];
  newSyncToken?: string;
}

export interface IEmailProviderService {
  sendEmail(accountId: string, params: SendEmailParams): Promise<SendResult>;
  fetchEmails(accountId: string, options: FetchOptions): Promise<FetchResult>;
}
