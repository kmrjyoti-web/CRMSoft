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
var LinkContactToOrgHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkContactToOrgHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const link_contact_to_org_command_1 = require("./link-contact-to-org.command");
const contact_organization_entity_1 = require("../../../domain/entities/contact-organization.entity");
const contact_org_repository_interface_1 = require("../../../domain/interfaces/contact-org-repository.interface");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let LinkContactToOrgHandler = LinkContactToOrgHandler_1 = class LinkContactToOrgHandler {
    constructor(repo, publisher, prisma) {
        this.repo = repo;
        this.publisher = publisher;
        this.prisma = prisma;
        this.logger = new common_1.Logger(LinkContactToOrgHandler_1.name);
    }
    async execute(command) {
        try {
            const contact = await this.prisma.working.contact.findUnique({
                where: { id: command.contactId },
                select: { id: true, isActive: true },
            });
            if (!contact)
                throw new common_1.NotFoundException(`Contact ${command.contactId} not found`);
            const org = await this.prisma.working.organization.findUnique({
                where: { id: command.organizationId },
                select: { id: true, isActive: true },
            });
            if (!org)
                throw new common_1.NotFoundException(`Organization ${command.organizationId} not found`);
            const existing = await this.repo.findByContactAndOrg(command.contactId, command.organizationId);
            if (existing && existing.isActive) {
                throw new common_1.ConflictException('Contact is already linked to this organization');
            }
            if (existing && !existing.isActive) {
                const withEvents = this.publisher.mergeObjectContext(existing);
                withEvents.reactivate();
                if (command.relationType)
                    withEvents.changeRelationType(command.relationType);
                await this.repo.save(withEvents);
                withEvents.commit();
                this.logger.log(`Reactivated link: Contact ${command.contactId} ↔ Org ${command.organizationId}`);
                return existing.id;
            }
            if (command.isPrimary) {
                await this.prisma.working.contactOrganization.updateMany({
                    where: { organizationId: command.organizationId, isPrimary: true },
                    data: { isPrimary: false },
                });
            }
            const mapping = contact_organization_entity_1.ContactOrganizationEntity.create((0, crypto_1.randomUUID)(), {
                contactId: command.contactId,
                organizationId: command.organizationId,
                relationType: command.relationType,
                isPrimary: command.isPrimary,
                designation: command.designation,
                department: command.department,
                startDate: command.startDate,
            });
            const withEvents = this.publisher.mergeObjectContext(mapping);
            await this.repo.save(withEvents);
            withEvents.commit();
            this.logger.log(`Linked: Contact ${command.contactId} ↔ Org ${command.organizationId} (${mapping.relationType.value})`);
            return mapping.id;
        }
        catch (error) {
            this.logger.error(`LinkContactToOrgHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.LinkContactToOrgHandler = LinkContactToOrgHandler;
exports.LinkContactToOrgHandler = LinkContactToOrgHandler = LinkContactToOrgHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(link_contact_to_org_command_1.LinkContactToOrgCommand),
    __param(0, (0, common_1.Inject)(contact_org_repository_interface_1.CONTACT_ORG_REPOSITORY)),
    __metadata("design:paramtypes", [Object, cqrs_1.EventPublisher,
        prisma_service_1.PrismaService])
], LinkContactToOrgHandler);
//# sourceMappingURL=link-contact-to-org.handler.js.map