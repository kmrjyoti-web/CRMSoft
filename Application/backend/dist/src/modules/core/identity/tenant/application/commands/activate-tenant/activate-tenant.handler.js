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
var ActivateTenantHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivateTenantHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const activate_tenant_command_1 = require("./activate-tenant.command");
const prisma_service_1 = require("../../../../../../../core/prisma/prisma.service");
let ActivateTenantHandler = ActivateTenantHandler_1 = class ActivateTenantHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ActivateTenantHandler_1.name);
    }
    async execute(command) {
        try {
            const tenant = await this.prisma.identity.tenant.update({
                where: { id: command.tenantId },
                data: { status: 'ACTIVE' },
            });
            this.logger.log(`Tenant activated: ${tenant.id}`);
            return tenant;
        }
        catch (error) {
            this.logger.error(`ActivateTenantHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ActivateTenantHandler = ActivateTenantHandler;
exports.ActivateTenantHandler = ActivateTenantHandler = ActivateTenantHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(activate_tenant_command_1.ActivateTenantCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ActivateTenantHandler);
//# sourceMappingURL=activate-tenant.handler.js.map