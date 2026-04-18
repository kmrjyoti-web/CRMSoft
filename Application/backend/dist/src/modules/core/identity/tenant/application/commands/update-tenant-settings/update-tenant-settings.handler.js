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
var UpdateTenantSettingsHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTenantSettingsHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const update_tenant_settings_command_1 = require("./update-tenant-settings.command");
const prisma_service_1 = require("../../../../../../../core/prisma/prisma.service");
let UpdateTenantSettingsHandler = UpdateTenantSettingsHandler_1 = class UpdateTenantSettingsHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(UpdateTenantSettingsHandler_1.name);
    }
    async execute(command) {
        try {
            const tenant = await this.prisma.identity.tenant.update({
                where: { id: command.tenantId },
                data: { settings: command.settings },
            });
            this.logger.log(`Tenant settings updated: ${tenant.id}`);
            return tenant;
        }
        catch (error) {
            this.logger.error(`UpdateTenantSettingsHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.UpdateTenantSettingsHandler = UpdateTenantSettingsHandler;
exports.UpdateTenantSettingsHandler = UpdateTenantSettingsHandler = UpdateTenantSettingsHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(update_tenant_settings_command_1.UpdateTenantSettingsCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UpdateTenantSettingsHandler);
//# sourceMappingURL=update-tenant-settings.handler.js.map