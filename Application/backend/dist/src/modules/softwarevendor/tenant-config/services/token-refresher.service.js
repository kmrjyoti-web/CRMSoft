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
var TokenRefresherService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenRefresherService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const encryption_service_1 = require("./encryption.service");
let TokenRefresherService = TokenRefresherService_1 = class TokenRefresherService {
    constructor(prisma, encryption) {
        this.prisma = prisma;
        this.encryption = encryption;
        this.logger = new common_1.Logger(TokenRefresherService_1.name);
    }
    async refreshExpiringTokens() {
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
            }
            catch (error) {
                this.logger.error(`Failed to refresh credential ${cred.id}: ${error.message}`);
            }
        }
    }
    async refreshToken(credentialId) {
        const cred = await this.prisma.tenantCredential.findUnique({
            where: { id: credentialId },
        });
        if (!cred)
            return { success: false, message: 'Credential not found' };
        const decrypted = this.encryption.decrypt(cred.encryptedData);
        let result = null;
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
        }
        catch (error) {
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
        if (!result)
            return { success: false, message: 'No token received' };
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
    async resetDailyUsage() {
        await this.prisma.tenantCredential.updateMany({
            data: { dailyUsageCount: 0 },
        });
        this.logger.log('Daily usage counts reset');
    }
    async refreshGoogle(creds) {
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
    async refreshMicrosoft(creds) {
        const tenantId = creds.tenantId || 'common';
        const res = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: creds.clientId,
                client_secret: creds.clientSecret,
                refresh_token: creds.refreshToken,
                grant_type: 'refresh_token',
                scope: 'https://graph.microsoft.com/.default',
            }),
        });
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
    async refreshDropbox(creds) {
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
};
exports.TokenRefresherService = TokenRefresherService;
exports.TokenRefresherService = TokenRefresherService = TokenRefresherService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        encryption_service_1.EncryptionService])
], TokenRefresherService);
//# sourceMappingURL=token-refresher.service.js.map