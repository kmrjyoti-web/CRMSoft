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
exports.VendorServiceMonolith = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../core/prisma/prisma.service");
let VendorServiceMonolith = class VendorServiceMonolith {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getLookupValues(category) {
        const master = await this.prisma.platform.masterLookup.findFirst({
            where: { category: category.toUpperCase() },
        });
        if (!master)
            return [];
        const values = await this.prisma.platform.lookupValue.findMany({
            where: { lookupId: master.id, isActive: true },
            orderBy: { rowIndex: 'asc' },
            select: { value: true, label: true, rowIndex: true },
        });
        return values.map((v) => ({
            code: v.value,
            label: v.label,
            sortOrder: v.rowIndex ?? undefined,
        }));
    }
    async getPackageByTenantId(tenantId) {
        const pkg = await this.prisma.platform.package.findFirst({
            where: { tenantId, isActive: true },
            select: { id: true, name: true },
        });
        if (!pkg)
            return null;
        const modules = await this.prisma.platform.moduleDefinition
            .findMany({ where: { isActive: true }, select: { code: true } })
            .catch(() => []);
        return {
            id: pkg.id,
            name: pkg.name,
            modules: modules.map((m) => m.code),
        };
    }
    async getModulesByPackageId(packageId) {
        const defs = await this.prisma.platform.moduleDefinition
            .findMany({ where: { isActive: true }, select: { id: true, code: true, name: true } })
            .catch(() => []);
        return defs.map((d) => ({ id: d.id, code: d.code, name: d.name }));
    }
    async getIndustryType(code) {
        const bt = await this.prisma.platform.businessTypeRegistry.findFirst({
            where: { typeCode: code, isActive: true },
            select: { id: true, typeCode: true, typeName: true },
        });
        if (!bt)
            return null;
        return { id: bt.id, code: bt.typeCode, name: bt.typeName, config: {} };
    }
};
exports.VendorServiceMonolith = VendorServiceMonolith;
exports.VendorServiceMonolith = VendorServiceMonolith = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VendorServiceMonolith);
//# sourceMappingURL=vendor-service.monolith.js.map