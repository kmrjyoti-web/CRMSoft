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
exports.TerminologyService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let TerminologyService = class TerminologyService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getResolved(tenantId) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
        });
        if (!tenant)
            throw new common_1.NotFoundException('Tenant not found');
        const businessType = tenant.businessTypeId
            ? await this.prisma.platform.businessTypeRegistry.findUnique({ where: { id: tenant.businessTypeId } })
            : null;
        const result = businessType
            ? { ...businessType.terminologyMap }
            : {};
        const overrides = await this.prisma.terminologyOverride.findMany({
            where: { tenantId, isActive: true },
            orderBy: { createdAt: 'asc' },
        });
        for (const ov of overrides) {
            result[ov.termKey] = ov.customLabel;
        }
        return result;
    }
    async list(tenantId) {
        return this.prisma.terminologyOverride.findMany({
            where: { tenantId },
            orderBy: { termKey: 'asc' },
        });
    }
    async upsert(tenantId, data) {
        const scope = data.scope ?? 'GLOBAL';
        return this.prisma.terminologyOverride.upsert({
            where: {
                tenantId_termKey_scope: { tenantId, termKey: data.termKey, scope },
            },
            update: {
                customLabel: data.customLabel,
                defaultLabel: data.defaultLabel,
                regionalLabel: data.regionalLabel ?? null,
                userHelpText: data.userHelpText ?? null,
            },
            create: {
                tenantId,
                termKey: data.termKey,
                defaultLabel: data.defaultLabel,
                customLabel: data.customLabel,
                scope,
                regionalLabel: data.regionalLabel ?? null,
                userHelpText: data.userHelpText ?? null,
            },
        });
    }
    async bulkUpsert(tenantId, items) {
        return Promise.all(items.map((item) => this.upsert(tenantId, item)));
    }
    async remove(tenantId, termKey, scope = 'GLOBAL') {
        return this.prisma.terminologyOverride.delete({
            where: {
                tenantId_termKey_scope: { tenantId, termKey, scope },
            },
        });
    }
};
exports.TerminologyService = TerminologyService;
exports.TerminologyService = TerminologyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TerminologyService);
//# sourceMappingURL=terminology.service.js.map