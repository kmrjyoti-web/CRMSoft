import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { CredentialService } from '../../../softwarevendor/tenant-config/services/credential.service';
import { IEmailProviderService, SendEmailParams, SendResult, FetchOptions, FetchResult } from './email-provider.interface';
import { CrossService } from '../../../../common/decorators/cross-service.decorator';

@CrossService('vendor', 'Uses CredentialService from tenant-config to retrieve tenant OAuth tokens for Microsoft Graph API access')
@Injectable()
export class OutlookService implements IEmailProviderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly credentialService: CredentialService,
  ) {}

  async sendEmail(accountId: string, params: SendEmailParams): Promise<SendResult> {
    // In production: POST https://graph.microsoft.com/v1.0/me/sendMail
    const account = await this.prisma.working.emailAccount.findUniqueOrThrow({ where: { id: accountId } });
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

  async getAuthUrl(tenantId: string, userId: string, redirectUrl: string): Promise<string> {
    const creds = await this.credentialService.get(tenantId, 'OUTLOOK' as any);
    const clientId = creds?.clientId || process.env.MICROSOFT_CLIENT_ID || '';

    if (!clientId) {
      throw new BadRequestException(
        'Outlook OAuth is not configured. Please add Microsoft credentials in Settings > Integrations.',
      );
    }

    const msftTenantId = creds?.tenantId || 'common';
    const scopes = 'Mail.ReadWrite Mail.Send User.Read offline_access';
    return `https://login.microsoftonline.com/${msftTenantId}/oauth2/v2.0/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUrl)}&response_type=code&scope=${encodeURIComponent(scopes)}&state=${userId}`;
  }

  async handleOAuthCallback(tenantId: string, code: string, userId: string, redirectUrl: string) {
    const creds = await this.credentialService.get(tenantId, 'OUTLOOK' as any);
    const clientId = creds?.clientId || process.env.MICROSOFT_CLIENT_ID || '';
    const clientSecret = creds?.clientSecret || process.env.MICROSOFT_CLIENT_SECRET || '';

    if (!clientId || !clientSecret) {
      throw new BadRequestException('Outlook OAuth credentials not configured for this tenant');
    }

    const msftTenantId = creds?.tenantId || 'common';

    // Exchange code for tokens
    const res = await fetch(
      `https://login.microsoftonline.com/${msftTenantId}/oauth2/v2.0/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUrl,
          grant_type: 'authorization_code',
          scope: 'https://graph.microsoft.com/.default',
        }),
      },
    );

    const data = await res.json();

    if (data.error) {
      throw new BadRequestException(`Microsoft OAuth error: ${data.error_description || data.error}`);
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in || 3600,
    };
  }
}
