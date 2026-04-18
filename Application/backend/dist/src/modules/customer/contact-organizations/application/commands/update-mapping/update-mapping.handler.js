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
var UpdateMappingHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateMappingHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const update_mapping_command_1 = require("./update-mapping.command");
const contact_org_repository_interface_1 = require("../../../domain/interfaces/contact-org-repository.interface");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let UpdateMappingHandler = UpdateMappingHandler_1 = class UpdateMappingHandler {
    constructor(repo, prisma) {
        this.repo = repo;
        this.prisma = prisma;
        this.logger = new common_1.Logger(UpdateMappingHandler_1.name);
    }
    async execute(command) {
        try {
            const mapping = await this.repo.findById(command.mappingId);
            if (!mapping)
                throw new common_1.NotFoundException(`Mapping ${command.mappingId} not found`);
            if (!mapping.isActive)
                throw new Error('Cannot update deactivated mapping');
            const updateData = {};
            if (command.data.designation !== undefined)
                updateData.designation = command.data.designation;
            if (command.data.department !== undefined)
                updateData.department = command.data.department;
            if (Object.keys(updateData).length === 0) {
                throw new Error('No fields provided to update');
            }
            await this.prisma.working.contactOrganization.update({
                where: { id: command.mappingId },
                data: updateData,
            });
            this.logger.log(`Mapping ${command.mappingId} updated`);
        }
        catch (error) {
            this.logger.error(`UpdateMappingHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.UpdateMappingHandler = UpdateMappingHandler;
exports.UpdateMappingHandler = UpdateMappingHandler = UpdateMappingHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(update_mapping_command_1.UpdateMappingCommand),
    __param(0, (0, common_1.Inject)(contact_org_repository_interface_1.CONTACT_ORG_REPOSITORY)),
    __metadata("design:paramtypes", [Object, prisma_service_1.PrismaService])
], UpdateMappingHandler);
//# sourceMappingURL=update-mapping.handler.js.map