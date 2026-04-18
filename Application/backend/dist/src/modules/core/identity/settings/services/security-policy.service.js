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
var SecurityPolicyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityPolicyService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const app_error_1 = require("../../../../../common/errors/app-error");
let SecurityPolicyService = SecurityPolicyService_1 = class SecurityPolicyService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(SecurityPolicyService_1.name);
    }
    async get(tenantId) {
        const policy = await this.prisma.identity.securityPolicy.findUnique({
            where: { tenantId },
            include: { ipRules: { where: { isActive: true } } },
        });
        if (!policy)
            throw app_error_1.AppError.from('CONFIG_ERROR');
        return policy;
    }
    async update(tenantId, data, userId) {
        return this.prisma.identity.securityPolicy.upsert({
            where: { tenantId },
            update: { ...data, updatedById: userId },
            create: { tenantId, ...data, updatedById: userId },
        });
    }
    async addIpRule(tenantId, rule) {
        const policy = await this.ensurePolicy(tenantId);
        return this.prisma.identity.ipAccessRule.create({
            data: { securityPolicyId: policy.id, ...rule },
        });
    }
    async removeIpRule(ruleId) {
        await this.prisma.identity.ipAccessRule.update({
            where: { id: ruleId },
            data: { isActive: false },
        });
    }
    async listIpRules(tenantId) {
        const policy = await this.prisma.identity.securityPolicy.findUnique({ where: { tenantId } });
        if (!policy)
            return [];
        return this.prisma.identity.ipAccessRule.findMany({
            where: { securityPolicyId: policy.id, isActive: true },
        });
    }
    async validatePassword(tenantId, password) {
        const policy = await this.prisma.identity.securityPolicy.findUnique({ where: { tenantId } });
        if (!policy)
            return { valid: true, errors: [] };
        const errors = [];
        if (password.length < policy.passwordMinLength) {
            errors.push(`Minimum ${policy.passwordMinLength} characters required`);
        }
        if (password.length > policy.passwordMaxLength) {
            errors.push(`Maximum ${policy.passwordMaxLength} characters allowed`);
        }
        if (policy.requireUppercase && !/[A-Z]/.test(password))
            errors.push('Must contain uppercase letter');
        if (policy.requireLowercase && !/[a-z]/.test(password))
            errors.push('Must contain lowercase letter');
        if (policy.requireNumbers && !/\d/.test(password))
            errors.push('Must contain a number');
        if (policy.requireSpecialChars && !/[^A-Za-z0-9]/.test(password))
            errors.push('Must contain special character');
        return { valid: errors.length === 0, errors };
    }
    async isIpAllowed(tenantId, ip) {
        const policy = await this.prisma.identity.securityPolicy.findUnique({
            where: { tenantId },
            include: { ipRules: { where: { isActive: true } } },
        });
        if (!policy?.ipRestrictionEnabled || !policy.ipRules.length)
            return true;
        const whitelist = policy.ipRules.filter((r) => r.ruleType === 'WHITELIST');
        const blacklist = policy.ipRules.filter((r) => r.ruleType === 'BLACKLIST');
        if (blacklist.some((r) => this.ipMatches(ip, r.ipAddress)))
            return false;
        if (whitelist.length > 0)
            return whitelist.some((r) => this.ipMatches(ip, r.ipAddress));
        return true;
    }
    ipMatches(ip, rule) {
        if (!rule.includes('/'))
            return ip === rule;
        const [network, bits] = rule.split('/');
        const mask = ~((1 << (32 - Number(bits))) - 1);
        const ipNum = this.ipToNum(ip);
        const netNum = this.ipToNum(network);
        return (ipNum & mask) === (netNum & mask);
    }
    ipToNum(ip) {
        return ip.split('.').reduce((acc, oct) => (acc << 8) + Number(oct), 0);
    }
    async ensurePolicy(tenantId) {
        return this.prisma.identity.securityPolicy.upsert({
            where: { tenantId },
            update: {},
            create: { tenantId },
        });
    }
};
exports.SecurityPolicyService = SecurityPolicyService;
exports.SecurityPolicyService = SecurityPolicyService = SecurityPolicyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SecurityPolicyService);
//# sourceMappingURL=security-policy.service.js.map