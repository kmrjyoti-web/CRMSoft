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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutlookService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const credential_service_1 = require("../../../softwarevendor/tenant-config/services/credential.service");
const cross_service_decorator_1 = require("../../../../common/decorators/cross-service.decorator");
let OutlookService = class OutlookService {
    constructor(prisma, credentialService) {
        this.prisma = prisma;
        this.credentialService = credentialService;
    }
    async sendEmail(accountId, params) {
        const account = await this.prisma.working.emailAccount.findUniqueOrThrow({ where: { id: accountId } });
        return {
            messageId: `outlook-${Date.now()}@outlook.com`,
            providerMessageId: `msg-${Date.now()}`,
        };
    }
    async fetchEmails(accountId, options) {
        return { emails: [], newSyncToken: `delta-${Date.now()}` };
    }
    async getAuthUrl(tenantId, userId, redirectUrl) {
        const creds = await this.credentialService.get(tenantId, 'OUTLOOK');
        const clientId = creds?.clientId || process.env.MICROSOFT_CLIENT_ID || '';
        if (!clientId) {
            throw new common_1.BadRequestException('Outlook OAuth is not configured. Please add Microsoft credentials in Settings > Integrations.');
        }
        const msftTenantId = creds?.tenantId || 'common';
        const scopes = 'Mail.ReadWrite Mail.Send User.Read offline_access';
        return `https://login.microsoftonline.com/${msftTenantId}/oauth2/v2.0/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUrl)}&response_type=code&scope=${encodeURIComponent(scopes)}&state=${userId}`;
    }
    async handleOAuthCallback(tenantId, code, userId, redirectUrl) {
        const creds = await this.credentialService.get(tenantId, 'OUTLOOK');
        const clientId = creds?.clientId || process.env.MICROSOFT_CLIENT_ID || '';
        const clientSecret = creds?.clientSecret || process.env.MICROSOFT_CLIENT_SECRET || '';
        if (!clientId || !clientSecret) {
            throw new common_1.BadRequestException('Outlook OAuth credentials not configured for this tenant');
        }
        const msftTenantId = creds?.tenantId || 'common';
        const res = await fetch(`https://login.microsoftonline.com/${msftTenantId}/oauth2/v2.0/token`, {
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
        });
        const data = await res.json();
        if (data.error) {
            throw new common_1.BadRequestException(`Microsoft OAuth error: ${data.error_description || data.error}`);
        }
        return {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresIn: data.expires_in || 3600,
        };
    }
};
exports.OutlookService = OutlookService;
exports.OutlookService = OutlookService = __decorate([
    (0, cross_service_decorator_1.CrossService)('vendor', 'Uses CredentialService from tenant-config to retrieve tenant OAuth tokens for Microsoft Graph API access'),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        credential_service_1.CredentialService])
], OutlookService);
//# sourceMappingURL=outlook.service.js.map