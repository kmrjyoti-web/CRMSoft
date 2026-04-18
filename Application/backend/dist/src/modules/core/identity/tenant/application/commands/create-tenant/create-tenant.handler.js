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
var CreateTenantHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTenantHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
const create_tenant_command_1 = require("./create-tenant.command");
const tenant_provisioning_service_1 = require("../../../services/tenant-provisioning.service");
let CreateTenantHandler = CreateTenantHandler_1 = class CreateTenantHandler {
    constructor(provisioningService) {
        this.provisioningService = provisioningService;
        this.logger = new common_1.Logger(CreateTenantHandler_1.name);
    }
    async execute(command) {
        try {
            const hashedPassword = await bcrypt.hash(command.adminPassword, 12);
            const result = await this.provisioningService.provision({
                name: command.name,
                slug: command.slug,
                adminEmail: command.adminEmail,
                adminPassword: hashedPassword,
                adminFirstName: command.adminFirstName,
                adminLastName: command.adminLastName,
                planId: command.planId,
            });
            this.logger.log(`Tenant created: ${result.tenant.id} (${command.name})`);
            return result;
        }
        catch (error) {
            this.logger.error(`CreateTenantHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.CreateTenantHandler = CreateTenantHandler;
exports.CreateTenantHandler = CreateTenantHandler = CreateTenantHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(create_tenant_command_1.CreateTenantCommand),
    __metadata("design:paramtypes", [tenant_provisioning_service_1.TenantProvisioningService])
], CreateTenantHandler);
//# sourceMappingURL=create-tenant.handler.js.map