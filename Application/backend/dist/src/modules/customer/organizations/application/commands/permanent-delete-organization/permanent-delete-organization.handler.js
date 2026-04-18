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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PermanentDeleteOrganizationHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermanentDeleteOrganizationHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const permanent_delete_organization_command_1 = require("./permanent-delete-organization.command");
const organization_repository_interface_1 = require("../../../domain/interfaces/organization-repository.interface");
let PermanentDeleteOrganizationHandler = PermanentDeleteOrganizationHandler_1 = class PermanentDeleteOrganizationHandler {
    constructor(repo) {
        this.repo = repo;
        this.logger = new common_1.Logger(PermanentDeleteOrganizationHandler_1.name);
    }
    async execute(command) {
        try {
            const org = await this.repo.findById(command.organizationId);
            if (!org)
                throw new common_1.NotFoundException(`Organization ${command.organizationId} not found`);
            if (!org.isDeleted) {
                throw new common_1.BadRequestException('Organization must be soft-deleted before permanent deletion');
            }
            await this.repo.delete(command.organizationId);
            this.logger.log(`Organization ${command.organizationId} permanently deleted`);
        }
        catch (error) {
            this.logger.error(`PermanentDeleteOrganizationHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.PermanentDeleteOrganizationHandler = PermanentDeleteOrganizationHandler;
exports.PermanentDeleteOrganizationHandler = PermanentDeleteOrganizationHandler = PermanentDeleteOrganizationHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(permanent_delete_organization_command_1.PermanentDeleteOrganizationCommand),
    __param(0, (0, common_1.Inject)(organization_repository_interface_1.ORGANIZATION_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], PermanentDeleteOrganizationHandler);
//# sourceMappingURL=permanent-delete-organization.handler.js.map