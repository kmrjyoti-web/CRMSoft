import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { IEmailProviderService, SendEmailParams, SendResult, FetchOptions, FetchResult } from './email-provider.interface';

@Injectable()
export class OutlookService implements IEmailProviderService {
  constructor(private readonly prisma: PrismaService) {}

  async sendEmail(accountId: string, params: SendEmailParams): Promise<SendResult> {
    // In production: POST https://graph.microsoft.com/v1.0/me/sendMail
    const account = await this.prisma.emailAccount.findUniqueOrThrow({ where: { id: accountId } });
    return {
      messageId: `outlook-${Date.now()}@outlook.com`,
      providerMessageId: `msg-${Date.now()}`,
    };
  }

  async fetchEmails(accountId: string, options: FetchOptions): Promise<FetchResult> {
    // In production: use Microsoft Graph Delta API
    // GET /v1.0/me/mailFolders/inbox/messages/delta
    return { emails: [], newSyncToken: `delta-${Date.now()}` };
  }

  getAuthUrl(userId: string, redirectUrl: string): string {
    const clientId = process.env.MICROSOFT_CLIENT_ID || '';
    const scopes = 'Mail.ReadWrite Mail.Send User.Read';
    return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUrl)}&response_type=code&scope=${encodeURIComponent(scopes)}&state=${userId}`;
  }
}
