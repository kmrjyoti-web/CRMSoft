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
exports.CredentialService = void 0;
const common_1 = require("@nestjs/common");
const identity_client_1 = require("@prisma/identity-client");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const encryption_service_1 = require("./encryption.service");
const credential_schema_service_1 = require("./credential-schema.service");
let CredentialService = class CredentialService {
    constructor(prisma, encryption, schemaService) {
        this.prisma = prisma;
        this.encryption = encryption;
        this.schemaService = schemaService;
        this.cache = new Map();
        this.CACHE_TTL = 5 * 60 * 1000;
    }
    async get(tenantId, provider, instanceName) {
        const cacheKey = `${tenantId}:${provider}:${instanceName || 'primary'}`;
        const cached = this.cache.get(cacheKey);
        if (cached && cached.expiresAt > Date.now()) {
            return cached.data;
        }
        const where = { tenantId, provider, status: 'ACTIVE' };
        if (instanceName) {
            where.instanceName = instanceName;
        }
        else {
            where.isPrimary = true;
        }
        let credential = await this.prisma.tenantCredential.findFirst({ where });
        if (!credential) {
            const globalDefault = await this.prisma.globalDefaultCredential.findFirst({
                where: { provider, isEnabled: true, status: 'ACTIVE' },
            });
            if (globalDefault) {
                const data = this.encryption.decrypt(globalDefault.encryptedData);
                this.cache.set(cacheKey, { data, expiresAt: Date.now() + this.CACHE_TTL });
                return data;
            }
            return null;
        }
        const data = this.encryption.decrypt(credential.encryptedData);
        this.prisma.tenantCredential.update({
            where: { id: credential.id },
            data: {
                lastUsedAt: new Date(),
                usageCount: { increment: 1 },
                dailyUsageCount: { increment: 1 },
            },
        }).catch(() => { });
        if (credential.dailyUsageLimit && credential.dailyUsageCount >= credential.dailyUsageLimit) {
            return null;
        }
        this.cache.set(cacheKey, { data, expiresAt: Date.now() + this.CACHE_TTL });
        return data;
    }
    async isConfigured(tenantId, provider) {
        const count = await this.prisma.tenantCredential.count({
            where: { tenantId, provider, status: { in: ['ACTIVE', 'PENDING_SETUP'] } },
        });
        return count > 0;
    }
    async listForTenant(tenantId) {
        const credentials = await this.prisma.tenantCredential.findMany({
            where: { tenantId },
            orderBy: [{ provider: 'asc' }, { isPrimary: 'desc' }],
        });
        return credentials.map((cred) => {
            const decrypted = this.encryption.decrypt(cred.encryptedData);
            const masked = {};
            for (const [key, val] of Object.entries(decrypted)) {
                masked[key] = this.encryption.mask(String(val));
            }
            return {
                id: cred.id,
                provider: cred.provider,
                instanceName: cred.instanceName,
                status: cred.status,
                statusMessage: cred.statusMessage,
                isPrimary: cred.isPrimary,
                lastVerifiedAt: cred.lastVerifiedAt,
                lastUsedAt: cred.lastUsedAt,
                usageCount: cred.usageCount,
                dailyUsageCount: cred.dailyUsageCount,
                dailyUsageLimit: cred.dailyUsageLimit,
                linkedAccountEmail: cred.linkedAccountEmail,
                description: cred.description,
                maskedCredentials: masked,
                createdAt: cred.createdAt,
            };
        });
    }
    async getDetail(tenantId, credentialId) {
        const cred = await this.prisma.tenantCredential.findFirst({
            where: { tenantId, id: credentialId },
        });
        if (!cred)
            throw new common_1.NotFoundException('Credential not found');
        const decrypted = this.encryption.decrypt(cred.encryptedData);
        const masked = {};
        for (const [key, val] of Object.entries(decrypted)) {
            masked[key] = this.encryption.mask(String(val));
        }
        return {
            id: cred.id,
            provider: cred.provider,
            instanceName: cred.instanceName,
            status: cred.status,
            statusMessage: cred.statusMessage,
            isPrimary: cred.isPrimary,
            lastVerifiedAt: cred.lastVerifiedAt,
            lastVerifyError: cred.lastVerifyError,
            verifyCount: cred.verifyCount,
            tokenExpiresAt: cred.tokenExpiresAt,
            lastRefreshedAt: cred.lastRefreshedAt,
            lastUsedAt: cred.lastUsedAt,
            usageCount: cred.usageCount,
            dailyUsageCount: cred.dailyUsageCount,
            dailyUsageLimit: cred.dailyUsageLimit,
            linkedAccountEmail: cred.linkedAccountEmail,
            webhookUrl: cred.webhookUrl,
            description: cred.description,
            maskedCredentials: masked,
            createdById: cred.createdById,
            createdByName: cred.createdByName,
            createdAt: cred.createdAt,
            updatedAt: cred.updatedAt,
        };
    }
    async upsert(tenantId, params) {
        const validation = this.schemaService.validate(params.provider, params.credentials);
        if (!validation.valid) {
            throw new common_1.BadRequestException(validation.errors.join('; '));
        }
        const encryptedData = this.encryption.encrypt(params.credentials);
        const instanceName = params.instanceName || null;
        const result = await this.prisma.tenantCredential.upsert({
            where: {
                tenantId_provider_instanceName: {
                    tenantId,
                    provider: params.provider,
                    instanceName: instanceName,
                },
            },
            create: {
                tenantId,
                provider: params.provider,
                instanceName,
                encryptedData,
                status: 'PENDING_SETUP',
                description: params.description,
                isPrimary: params.isPrimary ?? true,
                dailyUsageLimit: params.dailyUsageLimit,
                linkedAccountEmail: params.linkedAccountEmail,
                webhookUrl: params.webhookUrl,
                createdById: params.userId,
                createdByName: params.userName,
            },
            update: {
                encryptedData,
                status: 'PENDING_SETUP',
                description: params.description,
                isPrimary: params.isPrimary,
                dailyUsageLimit: params.dailyUsageLimit,
                linkedAccountEmail: params.linkedAccountEmail,
                webhookUrl: params.webhookUrl,
                updatedById: params.userId,
                lastVerifyError: null,
            },
        });
        await this.logAccess(tenantId, result.id, 'UPSERT', params.userId, params.userName, params.provider);
        this.cache.delete(`${tenantId}:${params.provider}:${instanceName || 'primary'}`);
        return result;
    }
    async revoke(tenantId, credentialId, userId, userName) {
        const cred = await this.prisma.tenantCredential.findFirst({
            where: { tenantId, id: credentialId },
        });
        if (!cred)
            throw new common_1.NotFoundException('Credential not found');
        await this.prisma.tenantCredential.update({
            where: { id: credentialId },
            data: {
                status: 'REVOKED',
                encryptedData: this.encryption.encrypt({ revoked: true }),
                updatedById: userId,
            },
        });
        await this.logAccess(tenantId, credentialId, 'REVOKE', userId, userName, cred.provider);
        this.cache.delete(`${tenantId}:${cred.provider}:${cred.instanceName || 'primary'}`);
    }
    async getStatusSummary(tenantId) {
        const credentials = await this.prisma.tenantCredential.findMany({
            where: { tenantId },
            select: { provider: true, status: true },
        });
        const allProviders = Object.values(identity_client_1.CredentialProvider);
        const configuredProviders = new Set(credentials.map((c) => c.provider));
        const statusCounts = {};
        for (const cred of credentials) {
            statusCounts[cred.status] = (statusCounts[cred.status] || 0) + 1;
        }
        return {
            totalProviders: allProviders.length,
            configured: configuredProviders.size,
            active: statusCounts['ACTIVE'] || 0,
            expired: statusCounts['EXPIRED'] || 0,
            errors: statusCounts['ERROR'] || 0,
            pendingSetup: statusCounts['PENDING_SETUP'] || 0,
            missing: allProviders.filter((p) => !configuredProviders.has(p)),
        };
    }
    async logAccess(tenantId, credentialId, action, userId, userName, provider, details, ip) {
        await this.prisma.credentialAccessLog.create({
            data: {
                tenantId,
                credentialId,
                action,
                accessedById: userId,
                accessedByName: userName,
                accessedByIp: ip,
                provider: String(provider),
                details,
            },
        });
    }
    async getAccessLogs(tenantId, filters) {
        const where = { tenantId };
        if (filters.credentialId)
            where.credentialId = filters.credentialId;
        if (filters.action)
            where.action = filters.action;
        if (filters.dateFrom || filters.dateTo) {
            where.createdAt = {};
            if (filters.dateFrom)
                where.createdAt.gte = filters.dateFrom;
            if (filters.dateTo)
                where.createdAt.lte = filters.dateTo;
        }
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const [data, total] = await Promise.all([
            this.prisma.credentialAccessLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.credentialAccessLog.count({ where }),
        ]);
        return { data, total, page, limit };
    }
    async resetDailyUsage() {
        await this.prisma.tenantCredential.updateMany({
            data: { dailyUsageCount: 0 },
        });
    }
};
exports.CredentialService = CredentialService;
exports.CredentialService = CredentialService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        encryption_service_1.EncryptionService,
        credential_schema_service_1.CredentialSchemaService])
], CredentialService);
//# sourceMappingURL=credential.service.js.map