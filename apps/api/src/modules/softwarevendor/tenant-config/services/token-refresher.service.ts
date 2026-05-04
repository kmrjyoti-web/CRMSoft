import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { EncryptionService } from './encryption.service';

@Injectable()
export class TokenRefresherService {
  private readonly logger = new Logger(TokenRefresherService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly encryption: EncryptionService,
  ) {}

  /** Refresh expiring tokens. Called by cron-engine (TOKEN_REFRESH). */
  async refreshExpiringTokens(): Promise<void> {
    const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);

    const expiring = await this.prisma.tenantCredential.findMany({
      where: {
        tokenExpiresAt: { lte: oneHourFromNow },
        status: 'ACTIVE',
        provider: { in: ['GMAIL', 'OUTLOOK', 'GOOGLE_DRIVE', 'ONEDRIVE', 'DROPBOX'] },
      },
    });

    this.logger.log(`Found ${expiring.length} credentials to refresh`);

    for (const cred of expiring) {
      try {
        await this.refreshToken(cred.id);
      } catch (error: any) {
        this.logger.error(`Failed to refresh credential ${cred.id}: ${error.message}`);
      }
    }
  }

  async refreshToken(credentialId: string): Promise<{ success: boolean; message: string }> {
    const cred = await this.prisma.tenantCredential.findUnique({
      where: { id: credentialId },
    });

    if (!cred) return { success: false, message: 'Credential not found' };

    const decrypted = this.encryption.decrypt(cred.encryptedData);
    let result: { accessToken: string; expiresIn: number; refreshToken?: string } | null = null;

    try {
      switch (cred.provider) {
        case 'GMAIL':
        case 'GOOGLE_DRIVE':
          result = await this.refreshGoogle(decrypted);
          break;
        case 'OUTLOOK':
        case 'ONEDRIVE':
          result = await this.refreshMicrosoft(decrypted);
          break;
        case 'DROPBOX':
          result = await this.refreshDropbox(decrypted);
          break;
        default:
          return { success: false, message: `Provider ${cred.provider} does not support token refresh` };
      }
    } catch (error: any) {
      const newFailCount = cred.refreshFailCount + 1;
      const newStatus = newFailCount >= 3 ? 'EXPIRED' : cred.status;

      await this.prisma.tenantCredential.update({
        where: { id: credentialId },
        data: {
          refreshFailCount: newFailCount,
          status: newStatus,
          statusMessage: `Token refresh failed: ${error.message}`,
        },
      });

      return { success: false, message: error.message };
    }

    if (!result) return { success: false, message: 'No token received' };

    // Update credentials with new tokens
    const updatedCreds = { ...decrypted };
    if (result.refreshToken) {
      updatedCreds.refreshToken = result.refreshToken;
    }
    updatedCreds.accessToken = result.accessToken;

    const newEncrypted = this.encryption.encrypt(updatedCreds);
    const tokenExpiresAt = new Date(Date.now() + result.expiresIn * 1000);

    await this.prisma.tenantCredential.update({
      where: { id: credentialId },
      data: {
        encryptedData: newEncrypted,
        tokenExpiresAt,
        lastRefreshedAt: new Date(),
        refreshFailCount: 0,
        status: 'ACTIVE',
        statusMessage: 'Token refreshed successfully',
      },
    });

    return { success: true, message: 'Token refreshed' };
  }

  /** Reset daily usage counts. Called by cron-engine (RESET_DAILY_COUNTERS). */
  async resetDailyUsage(): Promise<void> {
    await this.prisma.tenantCredential.updateMany({
      data: { dailyUsageCount: 0 },
    });
    this.logger.log('Daily usage counts reset');
  }

  private async refreshGoogle(creds: Record<string, any>) {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: creds.clientId,
        client_secret: creds.clientSecret,
        refresh_token: creds.refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Google token refresh failed: ${error}`);
    }

    const data = await res.json();
    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in || 3600,
      refreshToken: data.refresh_token,
    };
  }

  private async refreshMicrosoft(creds: Record<string, any>) {
    const tenantId = creds.tenantId || 'common';
    const res = await fetch(
      `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: creds.clientId,
          client_secret: creds.clientSecret,
          refresh_token: creds.refreshToken,
          grant_type: 'refresh_token',
          scope: 'https://graph.microsoft.com/.default',
        }),
      },
    );

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Microsoft token refresh failed: ${error}`);
    }

    const data = await res.json();
    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in || 3600,
      refreshToken: data.refresh_token,
    };
  }

  private async refreshDropbox(creds: Record<string, any>) {
    const res = await fetch('https://api.dropboxapi.com/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: creds.appKey,
        client_secret: creds.appSecret,
        refresh_token: creds.refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Dropbox token refresh failed: ${error}`);
    }

    const data = await res.json();
    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in || 14400,
    };
  }
}
