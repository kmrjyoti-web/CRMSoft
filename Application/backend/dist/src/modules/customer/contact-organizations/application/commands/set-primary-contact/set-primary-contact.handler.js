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
var SetPrimaryContactHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetPrimaryContactHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const set_primary_contact_command_1 = require("./set-primary-contact.command");
const contact_org_repository_interface_1 = require("../../../domain/interfaces/contact-org-repository.interface");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let SetPrimaryContactHandler = SetPrimaryContactHandler_1 = class SetPrimaryContactHandler {
    constructor(repo, prisma) {
        this.repo = repo;
        this.prisma = prisma;
        this.logger = new common_1.Logger(SetPrimaryContactHandler_1.name);
    }
    async execute(command) {
        try {
            const mapping = await this.repo.findById(command.mappingId);
            if (!mapping)
                throw new common_1.NotFoundException(`Mapping ${command.mappingId} not found`);
            if (!mapping.isActive)
                throw new Error('Cannot set primary on deactivated mapping');
            if (mapping.isPrimary)
                return;
            await this.prisma.working.contactOrganization.updateMany({
                where: { organizationId: mapping.organizationId, isPrimary: true },
                data: { isPrimary: false },
            });
            await this.prisma.working.contactOrganization.update({
                where: { id: command.mappingId },
                data: { isPrimary: true },
            });
            this.logger.log(`Contact ${mapping.contactId} set as primary for Org ${mapping.organizationId}`);
        }
        catch (error) {
            this.logger.error(`SetPrimaryContactHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.SetPrimaryContactHandler = SetPrimaryContactHandler;
exports.SetPrimaryContactHandler = SetPrimaryContactHandler = SetPrimaryContactHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(set_primary_contact_command_1.SetPrimaryContactCommand),
    __param(0, (0, common_1.Inject)(contact_org_repository_interface_1.CONTACT_ORG_REPOSITORY)),
    __metadata("design:paramtypes", [Object, prisma_service_1.PrismaService])
], SetPrimaryContactHandler);
//# sourceMappingURL=set-primary-contact.handler.js.map