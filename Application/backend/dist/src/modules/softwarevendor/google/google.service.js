"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var GoogleService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../core/prisma/prisma.service");
const credential_service_1 = require("../../softwarevendor/tenant-config/services/credential.service");
const SCOPE_MAP = {
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
let GoogleService = GoogleService_1 = class GoogleService {
    constructor(prisma, credentialService) {
        this.prisma = prisma;
        this.credentialService = credentialService;
        this.logger = new common_1.Logger(GoogleService_1.name);
    }
    async getAuthUrl(tenantId, userId, services) {
        const { clientId } = await this.getClientCredentials(tenantId);
        const scopes = this.buildScopes(services);
        const frontendOrigin = process.env.FRONTEND_URL || process.env.CORS_ORIGINS?.split(',')[0] || 'http://localhost:3005';
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
    async handleCallback(tenantId, userId, code, services) {
        const { clientId, clientSecret } = await this.getClientCredentials(tenantId);
        const frontendOrigin = process.env.FRONTEND_URL || process.env.CORS_ORIGINS?.split(',')[0] || 'http://localhost:3005';
        const redirectUri = `${frontendOrigin}/settings/google/oauth-callback`;
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
            throw new common_1.BadRequestException(`Google OAuth error: ${data.error_description || data.error}`);
        }
        const profile = await this.fetchUserProfile(data.access_token);
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
                services: services,
            },
            update: {
                email: profile.email,
                name: profile.name,
                avatarUrl: profile.picture,
                accessToken: data.access_token,
                refreshToken: data.refresh_token || undefined,
                tokenExpiresAt: new Date(Date.now() + (data.expires_in || 3600) * 1000),
                services: services,
            },
        });
        this.logger.log(`Google connected for user ${userId}, services: ${services.join(', ')}`);
        return connection;
    }
    async getStatus(tenantId, userId) {
        const connection = await this.prisma.googleConnection.findUnique({
            where: { tenantId_userId: { tenantId, userId } },
        });
        if (!connection) {
            return { isConnected: false, services: [] };
        }
        const enabledServices = connection.services || [];
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
    async disconnect(tenantId, userId) {
        const connection = await this.prisma.googleConnection.findUnique({
            where: { tenantId_userId: { tenantId, userId } },
        });
        if (!connection) {
            throw new common_1.BadRequestException('No Google connection found');
        }
        try {
            await fetch(`https://oauth2.googleapis.com/revoke?token=${connection.accessToken}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            });
        }
        catch {
            this.logger.warn('Failed to revoke Google token, continuing with disconnect');
        }
        await this.prisma.googleConnection.delete({
            where: { tenantId_userId: { tenantId, userId } },
        });
        return { disconnected: true };
    }
    async syncService(tenantId, userId, serviceId) {
        const connection = await this.getConnection(tenantId, userId);
        const enabledServices = connection.services || [];
        if (!enabledServices.includes(serviceId)) {
            throw new common_1.BadRequestException(`Service "${serviceId}" is not enabled`);
        }
        const accessToken = await this.ensureFreshToken(connection);
        this.logger.log(`Syncing ${serviceId} for user ${userId}`);
        await this.prisma.googleConnection.update({
            where: { tenantId_userId: { tenantId, userId } },
            data: { lastSyncAt: new Date() },
        });
        return { synced: true, serviceId, syncedAt: new Date() };
    }
    async getCalendarSettings(tenantId, userId) {
        const connection = await this.getConnection(tenantId, userId);
        const settings = connection.calendarSettings || {
            syncDirection: 'TWO_WAY',
            syncFrequencyMinutes: 15,
        };
        return settings;
    }
    async updateCalendarSettings(tenantId, userId, settings) {
        await this.prisma.googleConnection.update({
            where: { tenantId_userId: { tenantId, userId } },
            data: { calendarSettings: settings },
        });
        return settings;
    }
    async getContactsSettings(tenantId, userId) {
        const connection = await this.getConnection(tenantId, userId);
        const settings = connection.contactsSettings || {
            syncDirection: 'TWO_WAY',
            conflictResolution: 'newer_wins',
        };
        return settings;
    }
    async updateContactsSettings(tenantId, userId, settings) {
        await this.prisma.googleConnection.update({
            where: { tenantId_userId: { tenantId, userId } },
            data: { contactsSettings: settings },
        });
        return settings;
    }
    async getClientCredentials(tenantId) {
        const creds = await this.credentialService.get(tenantId, 'GMAIL');
        const clientId = creds?.clientId || process.env.GOOGLE_CLIENT_ID || '';
        const clientSecret = creds?.clientSecret || process.env.GOOGLE_CLIENT_SECRET || '';
        if (!clientId || !clientSecret) {
            throw new common_1.BadRequestException('Google OAuth is not configured. Please add Google credentials in Settings > Integrations.');
        }
        return { clientId, clientSecret };
    }
    buildScopes(services) {
        const scopes = new Set(BASE_SCOPES);
        for (const svc of services) {
            const svcScopes = SCOPE_MAP[svc];
            if (svcScopes)
                svcScopes.forEach((s) => scopes.add(s));
        }
        return Array.from(scopes);
    }
    async fetchUserProfile(accessToken) {
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
    async getConnection(tenantId, userId) {
        const connection = await this.prisma.googleConnection.findUnique({
            where: { tenantId_userId: { tenantId, userId } },
        });
        if (!connection) {
            throw new common_1.BadRequestException('No Google connection found. Please connect first.');
        }
        return connection;
    }
    async ensureFreshToken(connection) {
        if (connection.tokenExpiresAt && connection.tokenExpiresAt > new Date()) {
            return connection.accessToken;
        }
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
            throw new common_1.BadRequestException('Failed to refresh Google token. Please reconnect.');
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
};
exports.GoogleService = GoogleService;
exports.GoogleService = GoogleService = GoogleService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        credential_service_1.CredentialService])
], GoogleService);
//# sourceMappingURL=google.service.js.map