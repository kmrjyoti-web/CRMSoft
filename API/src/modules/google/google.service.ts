import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CredentialService } from '../tenant-config/services/credential.service';

// ── Scope Map ──────────────────────────────────────────────
const SCOPE_MAP: Record<string, string[]> = {
  gmail: [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.modify',
  ],
  calendar: [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
  ],
  docs: [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/documents',
  ],
  meet: [
    'https://www.googleapis.com/auth/calendar.events',
  ],
  contacts: [
    'https://www.googleapis.com/auth/contacts',
    'https://www.googleapis.com/auth/contacts.readonly',
  ],
};

const BASE_SCOPES = [
  'openid',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];

@Injectable()
export class GoogleService {
  private readonly logger = new Logger(GoogleService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly credentialService: CredentialService,
  ) {}

  // ── Auth URL ──────────────────────────────────────────────

  async getAuthUrl(tenantId: string, userId: string, services: string[]): Promise<string> {
    const { clientId } = await this.getClientCredentials(tenantId);

    const scopes = this.buildScopes(services);
    const frontendOrigin = process.env.CORS_ORIGINS?.split(',')[0] || 'http://localhost:3005';
    const redirectUri = `${frontendOrigin}/settings/google/oauth-callback`;

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent',
      state: `${tenantId}:${userId}`,
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  // ── Token Exchange ────────────────────────────────────────

  async handleCallback(tenantId: string, userId: string, code: string, services: string[]) {
    const { clientId, clientSecret } = await this.getClientCredentials(tenantId);
    const frontendOrigin = process.env.CORS_ORIGINS?.split(',')[0] || 'http://localhost:3005';
    const redirectUri = `${frontendOrigin}/settings/google/oauth-callback`;

    // Exchange code for tokens
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const data = await res.json();
    if (data.error) {
      throw new BadRequestException(`Google OAuth error: ${data.error_description || data.error}`);
    }

    // Fetch user profile
    const profile = await this.fetchUserProfile(data.access_token);

    // Upsert connection record
    const connection = await this.prisma.googleConnection.upsert({
      where: { tenantId_userId: { tenantId, userId } },
      create: {
        tenantId,
        userId,
        email: profile.email,
        name: profile.name,
        avatarUrl: profile.picture,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        tokenExpiresAt: new Date(Date.now() + (data.expires_in || 3600) * 1000),
        services: services as any,
      },
      update: {
        email: profile.email,
        name: profile.name,
        avatarUrl: profile.picture,
        accessToken: data.access_token,
        refreshToken: data.refresh_token || undefined,
        tokenExpiresAt: new Date(Date.now() + (data.expires_in || 3600) * 1000),
        services: services as any,
      },
    });

    this.logger.log(`Google connected for user ${userId}, services: ${services.join(', ')}`);
    return connection;
  }

  // ── Status ────────────────────────────────────────────────

  async getStatus(tenantId: string, userId: string) {
    const connection = await this.prisma.googleConnection.findUnique({
      where: { tenantId_userId: { tenantId, userId } },
    });

    if (!connection) {
      return { isConnected: false, services: [] };
    }

    const enabledServices = (connection.services as string[]) || [];

    return {
      isConnected: true,
      email: connection.email,
      name: connection.name,
      avatarUrl: connection.avatarUrl,
      connectedAt: connection.createdAt,
      services: enabledServices.map((serviceId) => ({
        serviceId,
        enabled: true,
        lastSyncAt: connection.lastSyncAt,
      })),
    };
  }

  // ── Disconnect ────────────────────────────────────────────

  async disconnect(tenantId: string, userId: string) {
    const connection = await this.prisma.googleConnection.findUnique({
      where: { tenantId_userId: { tenantId, userId } },
    });

    if (!connection) {
      throw new BadRequestException('No Google connection found');
    }

    // Revoke token at Google
    try {
      await fetch(`https://oauth2.googleapis.com/revoke?token=${connection.accessToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
    } catch {
      this.logger.warn('Failed to revoke Google token, continuing with disconnect');
    }

    await this.prisma.googleConnection.delete({
      where: { tenantId_userId: { tenantId, userId } },
    });

    return { disconnected: true };
  }

  // ── Sync ──────────────────────────────────────────────────

  async syncService(tenantId: string, userId: string, serviceId: string) {
    const connection = await this.getConnection(tenantId, userId);
    const enabledServices = (connection.services as string[]) || [];

    if (!enabledServices.includes(serviceId)) {
      throw new BadRequestException(`Service "${serviceId}" is not enabled`);
    }

    // Refresh token if expired
    const accessToken = await this.ensureFreshToken(connection);

    // Service-specific sync stubs (to be implemented per service)
    this.logger.log(`Syncing ${serviceId} for user ${userId}`);

    await this.prisma.googleConnection.update({
      where: { tenantId_userId: { tenantId, userId } },
      data: { lastSyncAt: new Date() },
    });

    return { synced: true, serviceId, syncedAt: new Date() };
  }

  // ── Calendar Settings ─────────────────────────────────────

  async getCalendarSettings(tenantId: string, userId: string) {
    const connection = await this.getConnection(tenantId, userId);
    const settings = (connection.calendarSettings as any) || {
      syncDirection: 'TWO_WAY',
      syncFrequencyMinutes: 15,
    };
    return settings;
  }

  async updateCalendarSettings(tenantId: string, userId: string, settings: any) {
    await this.prisma.googleConnection.update({
      where: { tenantId_userId: { tenantId, userId } },
      data: { calendarSettings: settings },
    });
    return settings;
  }

  // ── Contacts Settings ─────────────────────────────────────

  async getContactsSettings(tenantId: string, userId: string) {
    const connection = await this.getConnection(tenantId, userId);
    const settings = (connection.contactsSettings as any) || {
      syncDirection: 'TWO_WAY',
      conflictResolution: 'newer_wins',
    };
    return settings;
  }

  async updateContactsSettings(tenantId: string, userId: string, settings: any) {
    await this.prisma.googleConnection.update({
      where: { tenantId_userId: { tenantId, userId } },
      data: { contactsSettings: settings },
    });
    return settings;
  }

  // ── Helpers ───────────────────────────────────────────────

  private async getClientCredentials(tenantId: string) {
    const creds = await this.credentialService.get(tenantId, 'GMAIL' as any);
    const clientId = creds?.clientId || process.env.GOOGLE_CLIENT_ID || '';
    const clientSecret = creds?.clientSecret || process.env.GOOGLE_CLIENT_SECRET || '';

    if (!clientId || !clientSecret) {
      throw new BadRequestException(
        'Google OAuth is not configured. Please add Google credentials in Settings > Integrations.',
      );
    }
    return { clientId, clientSecret };
  }

  private buildScopes(services: string[]): string[] {
    const scopes = new Set<string>(BASE_SCOPES);
    for (const svc of services) {
      const svcScopes = SCOPE_MAP[svc];
      if (svcScopes) svcScopes.forEach((s) => scopes.add(s));
    }
    return Array.from(scopes);
  }

  private async fetchUserProfile(accessToken: string) {
    const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();
    return {
      email: data.email || '',
      name: data.name || '',
      picture: data.picture || '',
    };
  }

  private async getConnection(tenantId: string, userId: string) {
    const connection = await this.prisma.googleConnection.findUnique({
      where: { tenantId_userId: { tenantId, userId } },
    });
    if (!connection) {
      throw new BadRequestException('No Google connection found. Please connect first.');
    }
    return connection;
  }

  private async ensureFreshToken(connection: any): Promise<string> {
    if (connection.tokenExpiresAt && connection.tokenExpiresAt > new Date()) {
      return connection.accessToken;
    }

    // Refresh the token
    const { clientId, clientSecret } = await this.getClientCredentials(connection.tenantId);
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: connection.refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    const data = await res.json();
    if (data.error) {
      throw new BadRequestException('Failed to refresh Google token. Please reconnect.');
    }

    await this.prisma.googleConnection.update({
      where: { id: connection.id },
      data: {
        accessToken: data.access_token,
        tokenExpiresAt: new Date(Date.now() + (data.expires_in || 3600) * 1000),
      },
    });

    return data.access_token;
  }
}
