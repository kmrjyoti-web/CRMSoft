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
var VerifyRawContactHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyRawContactHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const verify_raw_contact_command_1 = require("./verify-raw-contact.command");
const raw_contact_repository_interface_1 = require("../../../domain/interfaces/raw-contact-repository.interface");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let VerifyRawContactHandler = VerifyRawContactHandler_1 = class VerifyRawContactHandler {
    constructor(repo, publisher, prisma) {
        this.repo = repo;
        this.publisher = publisher;
        this.prisma = prisma;
        this.logger = new common_1.Logger(VerifyRawContactHandler_1.name);
    }
    async execute(command) {
        try {
            const rawContact = await this.repo.findById(command.rawContactId);
            if (!rawContact) {
                throw new common_1.NotFoundException(`RawContact ${command.rawContactId} not found`);
            }
            const rawContactDb = await this.prisma.working.rawContact.findUnique({
                where: { id: command.rawContactId },
                select: { tenantId: true },
            });
            const tenantId = rawContactDb?.tenantId ?? '';
            const contactId = (0, crypto_1.randomUUID)();
            await this.prisma.working.contact.create({
                data: {
                    id: contactId,
                    tenantId,
                    firstName: rawContact.firstName,
                    lastName: rawContact.lastName,
                    designation: rawContact.designation,
                    department: rawContact.department,
                    notes: rawContact.notes,
                    createdById: command.verifiedById,
                },
            });
            const withEvents = this.publisher.mergeObjectContext(rawContact);
            withEvents.verify(contactId, command.verifiedById);
            await this.prisma.working.communication.updateMany({
                where: { rawContactId: rawContact.id },
                data: { contactId },
            });
            const rawFilters = await this.prisma.working.rawContactFilter.findMany({
                where: { rawContactId: rawContact.id },
            });
            if (rawFilters.length) {
                await this.prisma.working.contactFilter.createMany({
                    data: rawFilters.map(f => ({
                        contactId,
                        lookupValueId: f.lookupValueId,
                    })),
                    skipDuplicates: true,
                });
            }
            if (command.organizationId) {
                await this.prisma.working.contactOrganization.create({
                    data: {
                        contactId,
                        organizationId: command.organizationId,
                        relationType: command.contactOrgRelationType || 'EMPLOYEE',
                        designation: rawContact.designation,
                        department: rawContact.department,
                    },
                });
                await this.prisma.working.communication.updateMany({
                    where: { rawContactId: rawContact.id, isPrimary: true },
                    data: { organizationId: command.organizationId },
                });
            }
            await this.repo.save(withEvents);
            withEvents.commit();
            this.logger.log(`RawContact ${rawContact.id} verified ? Contact ${contactId}`);
            return contactId;
        }
        catch (error) {
            this.logger.error(`VerifyRawContactHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.VerifyRawContactHandler = VerifyRawContactHandler;
exports.VerifyRawContactHandler = VerifyRawContactHandler = VerifyRawContactHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(verify_raw_contact_command_1.VerifyRawContactCommand),
    __param(0, (0, common_1.Inject)(raw_contact_repository_interface_1.RAW_CONTACT_REPOSITORY)),
    __metadata("design:paramtypes", [Object, cqrs_1.EventPublisher,
        prisma_service_1.PrismaService])
], VerifyRawContactHandler);
//# sourceMappingURL=verify-raw-contact.handler.js.map