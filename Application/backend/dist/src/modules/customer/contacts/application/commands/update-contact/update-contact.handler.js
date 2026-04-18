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
var UpdateContactHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateContactHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const update_contact_command_1 = require("./update-contact.command");
const contact_repository_interface_1 = require("../../../domain/interfaces/contact-repository.interface");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let UpdateContactHandler = UpdateContactHandler_1 = class UpdateContactHandler {
    constructor(repo, publisher, prisma) {
        this.repo = repo;
        this.publisher = publisher;
        this.prisma = prisma;
        this.logger = new common_1.Logger(UpdateContactHandler_1.name);
    }
    async execute(command) {
        try {
            const contact = await this.repo.findById(command.contactId);
            if (!contact)
                throw new common_1.NotFoundException(`Contact ${command.contactId} not found`);
            const withEvents = this.publisher.mergeObjectContext(contact);
            withEvents.updateDetails(command.data, command.updatedById);
            await this.repo.save(withEvents);
            if (command.organizationId !== undefined) {
                await this.prisma.working.contact.update({
                    where: { id: contact.id },
                    data: { organizationId: command.organizationId || null },
                });
            }
            if (command.communications !== undefined) {
                await this.prisma.working.communication.deleteMany({
                    where: { contactId: contact.id },
                });
                if (command.communications.length) {
                    await this.prisma.working.communication.createMany({
                        data: command.communications.map(c => ({
                            contactId: contact.id,
                            type: c.type,
                            value: c.value,
                            priorityType: (c.priorityType ?? 'PRIMARY'),
                            label: c.label,
                            isPrimary: c.isPrimary ?? false,
                        })),
                        skipDuplicates: true,
                    });
                }
            }
            if (command.filterIds !== undefined) {
                await this.prisma.working.contactFilter.deleteMany({
                    where: { contactId: contact.id },
                });
                if (command.filterIds.length) {
                    await this.prisma.working.contactFilter.createMany({
                        data: command.filterIds.map(fid => ({
                            contactId: contact.id,
                            lookupValueId: fid,
                        })),
                        skipDuplicates: true,
                    });
                }
            }
            withEvents.commit();
            this.logger.log(`Contact ${contact.id} updated`);
        }
        catch (error) {
            this.logger.error(`UpdateContactHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.UpdateContactHandler = UpdateContactHandler;
exports.UpdateContactHandler = UpdateContactHandler = UpdateContactHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(update_contact_command_1.UpdateContactCommand),
    __param(0, (0, common_1.Inject)(contact_repository_interface_1.CONTACT_REPOSITORY)),
    __metadata("design:paramtypes", [Object, cqrs_1.EventPublisher,
        prisma_service_1.PrismaService])
], UpdateContactHandler);
//# sourceMappingURL=update-contact.handler.js.map