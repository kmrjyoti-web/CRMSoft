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
var TableConfigService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableConfigService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let TableConfigService = TableConfigService_1 = class TableConfigService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(TableConfigService_1.name);
    }
    async getConfig(tableKey, userId, tenantId) {
        const userConfig = await this.prisma.working.tableConfig.findFirst({
            where: { tenantId, tableKey, userId },
        });
        if (userConfig)
            return userConfig;
        const tenantDefault = await this.prisma.working.tableConfig.findFirst({
            where: { tenantId, tableKey, userId: null, isDefault: true },
        });
        return tenantDefault;
    }
    async upsertUserConfig(tableKey, userId, tenantId, config) {
        return this.prisma.working.tableConfig.upsert({
            where: {
                tenantId_tableKey_userId: { tenantId, tableKey, userId },
            },
            update: { config },
            create: {
                tenantId,
                tableKey,
                userId,
                config,
                isDefault: false,
            },
        });
    }
    async upsertTenantDefault(tableKey, tenantId, config) {
        const existing = await this.prisma.working.tableConfig.findFirst({
            where: { tenantId, tableKey, userId: null, isDefault: true },
        });
        if (existing) {
            return this.prisma.working.tableConfig.update({
                where: { id: existing.id },
                data: { config },
            });
        }
        return this.prisma.working.tableConfig.create({
            data: {
                tenantId,
                tableKey,
                userId: null,
                config,
                isDefault: true,
            },
        });
    }
    async deleteUserConfig(tableKey, userId, tenantId) {
        const existing = await this.prisma.working.tableConfig.findFirst({
            where: { tenantId, tableKey, userId },
        });
        if (!existing)
            return { deleted: false };
        await this.prisma.working.tableConfig.delete({ where: { id: existing.id } });
        return { deleted: true };
    }
};
exports.TableConfigService = TableConfigService;
exports.TableConfigService = TableConfigService = TableConfigService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TableConfigService);
//# sourceMappingURL=table-config.service.js.map