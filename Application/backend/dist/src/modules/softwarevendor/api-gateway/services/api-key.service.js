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
var ApiKeyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiKeyService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const app_error_1 = require("../../../../common/errors/app-error");
const AVAILABLE_SCOPES = [
    { scope: 'leads:read', description: 'List and view leads', category: 'Leads' },
    { scope: 'leads:write', description: 'Create and update leads', category: 'Leads' },
    { scope: 'leads:delete', description: 'Delete leads', category: 'Leads' },
    { scope: 'contacts:read', description: 'List and view contacts', category: 'Contacts' },
    { scope: 'contacts:write', description: 'Create and update contacts', category: 'Contacts' },
    { scope: 'contacts:delete', description: 'Delete contacts', category: 'Contacts' },
    { scope: 'organizations:read', description: 'List and view organizations', category: 'Organizations' },
    { scope: 'organizations:write', description: 'Create and update organizations', category: 'Organizations' },
    { scope: 'activities:read', description: 'List and view activities', category: 'Activities' },
    { scope: 'activities:write', description: 'Create and update activities', category: 'Activities' },
    { scope: 'demos:read', description: 'List and view demos', category: 'Demos' },
    { scope: 'demos:write', description: 'Schedule and update demos', category: 'Demos' },
    { scope: 'quotations:read', description: 'List and view quotations', category: 'Quotations' },
    { scope: 'quotations:write', description: 'Create and update quotations', category: 'Quotations' },
    { scope: 'invoices:read', description: 'List and view invoices', category: 'Invoices' },
    { scope: 'invoices:write', description: 'Create and update invoices', category: 'Invoices' },
    { scope: 'payments:read', description: 'View payment history', category: 'Payments' },
    { scope: 'products:read', description: 'List and view products', category: 'Products' },
    { scope: 'products:write', description: 'Create and update products', category: 'Products' },
    { scope: 'documents:read', description: 'List and download documents', category: 'Documents' },
    { scope: 'documents:write', description: 'Upload documents', category: 'Documents' },
    { scope: 'webhooks:manage', description: 'Manage webhook endpoints', category: 'Webhooks' },
    { scope: 'custom_fields:read', description: 'Read custom field definitions', category: 'Custom Fields' },
    { scope: 'reports:read', description: 'Access report data', category: 'Reports' },
];
const VALID_SCOPE_SET = new Set(AVAILABLE_SCOPES.map(s => s.scope));
let ApiKeyService = ApiKeyService_1 = class ApiKeyService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ApiKeyService_1.name);
        this.cache = new Map();
        this.CACHE_TTL = 60_000;
    }
    async create(tenantId, dto, userId, userName) {
        for (const scope of dto.scopes) {
            if (!VALID_SCOPE_SET.has(scope)) {
                throw app_error_1.AppError.from('VALIDATION_ERROR').withDetails({ invalidScope: scope });
            }
        }
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
        if (!tenant)
            throw app_error_1.AppError.from('TENANT_NOT_FOUND');
        const env = dto.environment || 'live';
        const random = (0, crypto_1.randomBytes)(32).toString('hex').substring(0, 32);
        const fullKey = `crm_${env}_${tenant.slug}_${random}`;
        const keyHash = (0, crypto_1.createHash)('sha256').update(fullKey).digest('hex');
        const keyPrefix = `crm_${env}_`;
        const keyLastFour = random.substring(random.length - 4);
        const apiKey = await this.prisma.working.apiKey.create({
            data: {
                tenantId,
                name: dto.name,
                description: dto.description,
                keyPrefix,
                keyHash,
                keyLastFour,
                scopes: dto.scopes,
                environment: env,
                expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
                allowedIps: dto.allowedIps || [],
                rateLimitPerHour: dto.rateLimitPerHour,
                rateLimitPerDay: dto.rateLimitPerDay,
                rateLimitPerMinute: dto.rateLimitPerMinute,
                createdById: userId,
                createdByName: userName,
            },
        });
        this.logger.log(`API key "${dto.name}" created for tenant ${tenantId}`);
        return {
            apiKey,
            fullKey,
            warning: 'Copy this key now. It will not be shown again.',
        };
    }
    async validate(rawKey) {
        const keyHash = (0, crypto_1.createHash)('sha256').update(rawKey).digest('hex');
        const cached = this.cache.get(keyHash);
        if (cached && Date.now() - cached.cachedAt < this.CACHE_TTL) {
            return { apiKey: cached.apiKey, tenantId: cached.apiKey.tenantId };
        }
        const apiKey = await this.prisma.working.apiKey.findUnique({ where: { keyHash } });
        if (!apiKey)
            return null;
        if (apiKey.status !== 'API_ACTIVE')
            return null;
        if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
            await this.prisma.working.apiKey.update({
                where: { id: apiKey.id },
                data: { status: 'API_EXPIRED' },
            });
            return null;
        }
        await this.prisma.working.apiKey.update({
            where: { id: apiKey.id },
            data: {
                lastUsedAt: new Date(),
                totalRequests: { increment: 1 },
                requestsToday: { increment: 1 },
                requestsThisHour: { increment: 1 },
            },
        });
        this.cache.set(keyHash, { apiKey, cachedAt: Date.now() });
        return { apiKey, tenantId: apiKey.tenantId };
    }
    async listByTenant(tenantId) {
        return this.prisma.working.apiKey.findMany({
            where: { tenantId },
            select: {
                id: true, name: true, description: true, keyPrefix: true, keyLastFour: true,
                status: true, scopes: true, environment: true, expiresAt: true, allowedIps: true,
                lastUsedAt: true, totalRequests: true, requestsToday: true,
                rateLimitPerHour: true, rateLimitPerDay: true, rateLimitPerMinute: true,
                createdByName: true, createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getById(tenantId, apiKeyId) {
        const key = await this.prisma.working.apiKey.findFirst({
            where: { id: apiKeyId, tenantId },
            select: {
                id: true, name: true, description: true, keyPrefix: true, keyLastFour: true,
                status: true, scopes: true, environment: true, expiresAt: true, allowedIps: true,
                lastUsedAt: true, totalRequests: true, requestsToday: true, requestsThisHour: true,
                rateLimitPerHour: true, rateLimitPerDay: true, rateLimitPerMinute: true,
                createdById: true, createdByName: true, revokedAt: true, revokedReason: true,
                createdAt: true, updatedAt: true,
            },
        });
        if (!key)
            throw app_error_1.AppError.from('API_KEY_NOT_FOUND');
        return key;
    }
    async revoke(tenantId, apiKeyId, reason, userId) {
        const key = await this.prisma.working.apiKey.findFirst({
            where: { id: apiKeyId, tenantId },
        });
        if (!key)
            throw app_error_1.AppError.from('API_KEY_NOT_FOUND');
        await this.prisma.working.apiKey.update({
            where: { id: apiKeyId },
            data: {
                status: 'API_REVOKED',
                revokedAt: new Date(),
                revokedById: userId,
                revokedReason: reason,
            },
        });
        this.cache.clear();
        this.logger.log(`API key "${key.name}" revoked`);
    }
    async updateScopes(tenantId, apiKeyId, scopes) {
        for (const scope of scopes) {
            if (!VALID_SCOPE_SET.has(scope)) {
                throw app_error_1.AppError.from('VALIDATION_ERROR').withDetails({ invalidScope: scope });
            }
        }
        const key = await this.prisma.working.apiKey.findFirst({ where: { id: apiKeyId, tenantId } });
        if (!key)
            throw app_error_1.AppError.from('API_KEY_NOT_FOUND');
        const updated = await this.prisma.working.apiKey.update({
            where: { id: apiKeyId },
            data: { scopes },
        });
        this.cache.clear();
        return updated;
    }
    async regenerate(tenantId, apiKeyId, userId, userName) {
        const oldKey = await this.prisma.working.apiKey.findFirst({ where: { id: apiKeyId, tenantId } });
        if (!oldKey)
            throw app_error_1.AppError.from('API_KEY_NOT_FOUND');
        await this.revoke(tenantId, apiKeyId, 'Regenerated', userId);
        return this.create(tenantId, {
            name: oldKey.name,
            description: oldKey.description || undefined,
            scopes: oldKey.scopes,
            environment: oldKey.environment,
            allowedIps: oldKey.allowedIps,
            rateLimitPerHour: oldKey.rateLimitPerHour || undefined,
            rateLimitPerDay: oldKey.rateLimitPerDay || undefined,
            rateLimitPerMinute: oldKey.rateLimitPerMinute || undefined,
        }, userId, userName);
    }
    async resetDailyCounters() {
        const result = await this.prisma.working.apiKey.updateMany({
            where: { status: 'API_ACTIVE' },
            data: { requestsToday: 0, lastResetDate: new Date() },
        });
        this.logger.log(`Reset daily counters for ${result.count} API keys`);
        return result.count;
    }
    async resetHourlyCounters() {
        const result = await this.prisma.working.apiKey.updateMany({
            where: { status: 'API_ACTIVE' },
            data: { requestsThisHour: 0, lastResetHour: new Date() },
        });
        return result.count;
    }
    async markExpiredKeys() {
        const result = await this.prisma.working.apiKey.updateMany({
            where: {
                status: 'API_ACTIVE',
                expiresAt: { lt: new Date() },
            },
            data: { status: 'API_EXPIRED' },
        });
        if (result.count > 0) {
            this.logger.log(`Marked ${result.count} API keys as expired`);
        }
        return result.count;
    }
    getAvailableScopes() {
        return AVAILABLE_SCOPES;
    }
    isIpAllowed(apiKey, ip) {
        if (!apiKey.allowedIps || apiKey.allowedIps.length === 0)
            return true;
        return apiKey.allowedIps.some((allowed) => {
            if (allowed.includes('/')) {
                return this.isIpInCidr(ip, allowed);
            }
            return ip === allowed;
        });
    }
    isIpInCidr(ip, cidr) {
        const [range, bits] = cidr.split('/');
        const mask = ~(2 ** (32 - parseInt(bits)) - 1);
        const ipNum = this.ipToNum(ip);
        const rangeNum = this.ipToNum(range);
        return (ipNum & mask) === (rangeNum & mask);
    }
    ipToNum(ip) {
        return ip.split('.').reduce((sum, octet) => (sum << 8) + parseInt(octet), 0) >>> 0;
    }
};
exports.ApiKeyService = ApiKeyService;
exports.ApiKeyService = ApiKeyService = ApiKeyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ApiKeyService);
//# sourceMappingURL=api-key.service.js.map