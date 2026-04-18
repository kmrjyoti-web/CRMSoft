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
var CreateContactHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateContactHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const create_contact_command_1 = require("./create-contact.command");
const contact_entity_1 = require("../../../domain/entities/contact.entity");
const contact_repository_interface_1 = require("../../../domain/interfaces/contact-repository.interface");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let CreateContactHandler = CreateContactHandler_1 = class CreateContactHandler {
    constructor(repo, publisher, prisma) {
        this.repo = repo;
        this.publisher = publisher;
        this.prisma = prisma;
        this.logger = new common_1.Logger(CreateContactHandler_1.name);
    }
    async execute(command) {
        try {
            const contact = contact_entity_1.ContactEntity.create((0, crypto_1.randomUUID)(), {
                firstName: command.firstName,
                lastName: command.lastName,
                designation: command.designation,
                department: command.department,
                notes: command.notes,
                createdById: command.createdById,
            });
            const withEvents = this.publisher.mergeObjectContext(contact);
            await this.repo.save(withEvents);
            if (command.communications?.length) {
                for (const comm of command.communications) {
                    await this.prisma.working.communication.create({
                        data: {
                            type: comm.type,
                            value: comm.value,
                            priorityType: comm.priorityType || 'PRIMARY',
                            label: comm.label,
                            isPrimary: comm.isPrimary ?? false,
                            contactId: contact.id,
                        },
                    });
                }
            }
            if (command.organizationId) {
                await this.prisma.working.contactOrganization.create({
                    data: {
                        contactId: contact.id,
                        organizationId: command.organizationId,
                        relationType: command.orgRelationType || 'EMPLOYEE',
                        designation: command.designation,
                        department: command.department,
                    },
                });
            }
            if (command.filterIds?.length) {
                await this.prisma.working.contactFilter.createMany({
                    data: command.filterIds.map(fid => ({
                        contactId: contact.id,
                        lookupValueId: fid,
                    })),
                    skipDuplicates: true,
                });
            }
            withEvents.commit();
            this.logger.log(`Contact created directly: ${contact.id} (${contact.fullName})`);
            return contact.id;
        }
        catch (error) {
            this.logger.error(`CreateContactHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.CreateContactHandler = CreateContactHandler;
exports.CreateContactHandler = CreateContactHandler = CreateContactHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(create_contact_command_1.CreateContactCommand),
    __param(0, (0, common_1.Inject)(contact_repository_interface_1.CONTACT_REPOSITORY)),
    __metadata("design:paramtypes", [Object, cqrs_1.EventPublisher,
        prisma_service_1.PrismaService])
], CreateContactHandler);
//# sourceMappingURL=create-contact.handler.js.map