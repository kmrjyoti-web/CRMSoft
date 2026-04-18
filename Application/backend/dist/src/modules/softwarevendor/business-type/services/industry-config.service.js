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
exports.IndustryConfigService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let IndustryConfigService = class IndustryConfigService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getTenantWithBt(tenantId) {
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
        const bt = tenant?.businessTypeId
            ? await this.prisma.platform.businessTypeRegistry.findUnique({ where: { id: tenant.businessTypeId } })
            : null;
        return { tenant, bt };
    }
    async getConfig(tenantId) {
        const { bt } = await this.getTenantWithBt(tenantId);
        if (!bt)
            return null;
        return {
            typeCode: bt.typeCode,
            typeName: bt.typeName,
            industryCategory: bt.industryCategory,
            icon: bt.icon,
            colorTheme: bt.colorTheme,
            extraFields: bt.extraFields ?? {},
            defaultLeadStages: bt.defaultLeadStages,
            defaultActivityTypes: bt.defaultActivityTypes,
            dashboardWidgets: bt.dashboardWidgets ?? [],
        };
    }
    async getExtraFields(tenantId, entity) {
        const { bt } = await this.getTenantWithBt(tenantId);
        if (!bt)
            return [];
        const extraFields = (bt.extraFields ?? {});
        return extraFields[entity] || [];
    }
    async getLeadStages(tenantId) {
        const { bt } = await this.getTenantWithBt(tenantId);
        return bt?.defaultLeadStages ?? null;
    }
    async getActivityTypes(tenantId) {
        const { bt } = await this.getTenantWithBt(tenantId);
        return bt?.defaultActivityTypes ?? null;
    }
};
exports.IndustryConfigService = IndustryConfigService;
exports.IndustryConfigService = IndustryConfigService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], IndustryConfigService);
//# sourceMappingURL=industry-config.service.js.map