import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { CredentialService } from '../../../softwarevendor/tenant-config/services/credential.service';
import { IEmailProviderService, SendEmailParams, SendResult, FetchOptions, FetchResult } from './email-provider.interface';

@Injectable()
export class GmailService implements IEmailProviderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly credentialService: CredentialService,
  ) {}

  async sendEmail(accountId: string, params: SendEmailParams): Promise<SendResult> {
    // In production: use googleapis library
    // 1. Build RFC 2822 MIME message
    // 2. Base64url encode
    // 3. POST https://gmail.googleapis.com/gmail/v1/users/me/messages/send
    const account = await this.prisma.emailAccount.findUniqueOrThrow({ where: { id: accountId } });
    return {
      messageId: `gmail-${Date.now()}@mail.gmail.com`,
      providerMessageId: `msg-${Date.now()}`,
      threadId: `thread-${Date.now()}`,
    };
  }

  async fetchEmails(accountId: string, options: FetchOptions): Promise<FetchResult> {
    // In production: use Gmail History API for incremental sync
    // GET /gmail/v1/users/me/history?startHistoryId={syncToken}
    // Or full list: GET /gmail/v1/users/me/messages?maxResults=100
    return { emails: [], newSyncToken: `history-${Date.now()}` };
  }

  async getAuthUrl(tenantId: string, userId: string, redirectUrl: string): Promise<string> {
    const creds = await this.credentialService.get(tenantId, 'GMAIL' as any);
    const clientId = creds?.clientId || process.env.GOOGLE_CLIENT_ID || '';

    if (!clientId) {
      throw new BadRequestException(
        'Gmail OAuth is not configured. Please add Google credentials in Settings > Integrations.',
      );
    }

    const scopes = 'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.modify';
    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUrl)}&response_type=code&scope=${encodeURIComponent(scopes)}&access_type=offline&prompt=consent&state=${userId}`;
  }

  async handleOAuthCallback(tenantId: string, code: string, userId: string, redirectUrl: string) {
    const creds = await this.credentialService.get(tenantId, 'GMAIL' as any);
    const clientId = creds?.clientId || process.env.GOOGLE_CLIENT_ID || '';
    const clientSecret = creds?.clientSecret || process.env.GOOGLE_CLIENT_SECRET || '';

    if (!clientId || !clientSecret) {
      throw new BadRequestException('Gmail OAuth credentials not configured for this tenant');
    }

    // Exchange code for tokens
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUrl,
        grant_type: 'authorization_code',
      }),
    });

    const data = await res.json();

    if (data.error) {
      throw new BadRequestException(`Google OAuth error: ${data.error_description || data.error}`);
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in || 3600,
    };
  }
}
