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
var PluginMenuService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginMenuService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../core/prisma/prisma.service");
let PluginMenuService = PluginMenuService_1 = class PluginMenuService {
    async enableMenusForPlugin(tenantId, pluginCode) {
        const menuCodes = await this.getPluginMenuCodes(pluginCode);
        if (menuCodes.length === 0)
            return { enabled: [] };
        const enabled = [];
        for (const code of menuCodes) {
            try {
                const result = await this.prisma.menu.updateMany({
                    where: { tenantId, code, isActive: false },
                    data: { isActive: true },
                });
                if (result.count > 0) {
                    enabled.push(code);
                }
            }
            catch {
                this.logger.debug(`Menu code "${code}" not found for tenant ${tenantId}`);
            }
        }
        if (enabled.length > 0) {
            this.logger.log(`Enabled ${enabled.length} menu(s) for plugin "${pluginCode}" in tenant ${tenantId}: ${enabled.join(', ')}`);
        }
        return { enabled };
    }
    async disableMenusForPlugin(tenantId, pluginCode) {
        const menuCodes = await this.getPluginMenuCodes(pluginCode);
        if (menuCodes.length === 0)
            return { disabled: [] };
        const disabled = [];
        for (const code of menuCodes) {
            try {
                const result = await this.prisma.menu.updateMany({
                    where: { tenantId, code, isActive: true },
                    data: { isActive: false },
                });
                if (result.count > 0) {
                    disabled.push(code);
                }
            }
            catch {
                this.logger.debug(`Menu code "${code}" not found for tenant ${tenantId}`);
            }
        }
        if (disabled.length > 0) {
            this.logger.log(`Disabled ${disabled.length} menu(s) for plugin "${pluginCode}" in tenant ${tenantId}: ${disabled.join(', ')}`);
        }
        return { disabled };
    }
    async getPluginMenuCodes(pluginCode) {
        const plugin = await this.prisma.platform.pluginRegistry.findUnique({
            where: { code: pluginCode },
            select: { menuCodes: true },
        });
        return plugin?.menuCodes ?? [];
    }
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(PluginMenuService_1.name);
    }
};
exports.PluginMenuService = PluginMenuService;
exports.PluginMenuService = PluginMenuService = PluginMenuService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PluginMenuService);
//# sourceMappingURL=plugin-menu.service.js.map