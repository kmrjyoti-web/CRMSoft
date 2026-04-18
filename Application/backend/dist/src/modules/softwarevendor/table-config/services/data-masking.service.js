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
var DataMaskingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataMaskingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const cross_db_resolver_service_1 = require("../../../../core/prisma/cross-db-resolver.service");
const error_utils_1 = require("../../../../common/utils/error.utils");
let DataMaskingService = DataMaskingService_1 = class DataMaskingService {
    constructor(prisma, resolver) {
        this.prisma = prisma;
        this.resolver = resolver;
        this.logger = new common_1.Logger(DataMaskingService_1.name);
    }
    async getMaskingRules(tableKey, userId, roleId, tenantId) {
        const orConditions = [
            { userId, roleId: null },
            { roleId: null, userId: null },
        ];
        if (roleId) {
            orConditions.splice(1, 0, { roleId, userId: null });
        }
        const policies = await this.prisma.working.dataMaskingPolicy.findMany({
            where: {
                tenantId,
                tableKey,
                isActive: true,
                OR: orConditions,
            },
            orderBy: { createdAt: 'desc' },
        });
        this.logger.debug(`getMaskingRules: table=${tableKey}, userId=${userId}, roleId=${roleId}, ` +
            `tenantId=${tenantId}, found ${policies.length} policies`);
        const ruleMap = new Map();
        const sorted = policies.sort((a, b) => {
            const priority = (p) => p.userId ? 3 : p.roleId ? 2 : 1;
            return priority(a) - priority(b);
        });
        for (const p of sorted) {
            if (p.maskType === 'NONE') {
                ruleMap.delete(p.columnId);
            }
            else {
                ruleMap.set(p.columnId, {
                    columnId: p.columnId,
                    maskType: p.maskType,
                    canUnmask: p.canUnmask,
                });
            }
        }
        const rules = Array.from(ruleMap.values());
        if (rules.length > 0) {
            this.logger.log(`Masking rules for ${tableKey}: ${rules.map(r => `${r.columnId}(${r.maskType})`).join(', ')}`);
        }
        return rules;
    }
    applyMasking(records, rules) {
        if (rules.length === 0)
            return records;
        return records.map((record) => {
            const masked = { ...record };
            const maskingMeta = {};
            for (const rule of rules) {
                const value = record[rule.columnId];
                if (value == null)
                    continue;
                maskingMeta[rule.columnId] = {
                    masked: true,
                    canUnmask: rule.canUnmask,
                };
                masked[rule.columnId] = this.maskValue(String(value), rule.maskType);
            }
            if (Object.keys(maskingMeta).length > 0) {
                masked._maskingMeta = maskingMeta;
            }
            return masked;
        });
    }
    maskValue(value, maskType) {
        if (maskType === 'FULL') {
            return '****';
        }
        if (value.includes('@')) {
            const [local, domain] = value.split('@');
            if (local.length <= 2) {
                return `${local[0]}***@${domain}`;
            }
            return `${local[0]}${'*'.repeat(Math.min(local.length - 2, 4))}${local[local.length - 1]}@${domain}`;
        }
        if (value.length >= 8) {
            const maskedLen = Math.min(value.length - 6, 6);
            return value.slice(0, 2) + '*'.repeat(maskedLen) + value.slice(-4);
        }
        if (value.length >= 4) {
            return value[0] + '***' + value.slice(-2);
        }
        return '****';
    }
    async getUnmaskedValue(tableKey, columnId, recordId, userId, tenantId) {
        const modelMap = {
            contacts: 'contact',
            organizations: 'organization',
            leads: 'lead',
            activities: 'activity',
            'raw-contacts': 'rawContact',
            users: 'user',
        };
        const commFieldMap = {
            email: 'EMAIL',
            phone: 'MOBILE',
        };
        const model = modelMap[tableKey];
        if (!model)
            return null;
        await this.prisma.working.unmaskAuditLog.create({
            data: { tenantId, userId, tableKey, columnId, recordId },
        });
        const commType = commFieldMap[columnId];
        const commTables = ['contacts', 'raw-contacts', 'organizations'];
        if (commType && commTables.includes(tableKey)) {
            const fkField = tableKey === 'contacts' ? 'contactId'
                : tableKey === 'raw-contacts' ? 'rawContactId'
                    : 'organizationId';
            const comm = await this.prisma.working.communication.findFirst({
                where: {
                    [fkField]: recordId,
                    type: commType,
                },
                orderBy: { isPrimary: 'desc' },
                select: { value: true },
            });
            return comm?.value ?? null;
        }
        try {
            const record = await this.prisma[model].findUnique({
                where: { id: recordId },
                select: { [columnId]: true },
            });
            return record?.[columnId] ?? null;
        }
        catch (err) {
            this.logger.warn(`Failed to unmask ${tableKey}.${columnId}: ${(0, error_utils_1.getErrorMessage)(err)}`);
            return null;
        }
    }
    async listPolicies(tenantId, tableKey) {
        const where = { tenantId };
        if (tableKey)
            where.tableKey = tableKey;
        const policies = await this.prisma.working.dataMaskingPolicy.findMany({
            where,
            orderBy: [{ tableKey: 'asc' }, { columnId: 'asc' }],
        });
        return this.resolver.resolveRoles(policies, 'roleId', { id: true, displayName: true });
    }
    async createPolicy(tenantId, data) {
        return this.prisma.working.dataMaskingPolicy.create({
            data: {
                tenantId,
                tableKey: data.tableKey,
                columnId: data.columnId,
                roleId: data.roleId ?? null,
                userId: data.userId ?? null,
                maskType: data.maskType,
                canUnmask: data.canUnmask ?? false,
            },
        });
    }
    async updatePolicy(id, data) {
        return this.prisma.working.dataMaskingPolicy.update({
            where: { id },
            data,
        });
    }
    async deletePolicy(id) {
        await this.prisma.working.dataMaskingPolicy.delete({ where: { id } });
        return { deleted: true };
    }
};
exports.DataMaskingService = DataMaskingService;
exports.DataMaskingService = DataMaskingService = DataMaskingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cross_db_resolver_service_1.CrossDbResolverService])
], DataMaskingService);
//# sourceMappingURL=data-masking.service.js.map