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
var CreateRawContactHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateRawContactHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const create_raw_contact_command_1 = require("./create-raw-contact.command");
const raw_contact_entity_1 = require("../../../domain/entities/raw-contact.entity");
const raw_contact_repository_interface_1 = require("../../../domain/interfaces/raw-contact-repository.interface");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let CreateRawContactHandler = CreateRawContactHandler_1 = class CreateRawContactHandler {
    constructor(repo, publisher, prisma) {
        this.repo = repo;
        this.publisher = publisher;
        this.prisma = prisma;
        this.logger = new common_1.Logger(CreateRawContactHandler_1.name);
    }
    async execute(command) {
        try {
            const rawContact = raw_contact_entity_1.RawContactEntity.create((0, crypto_1.randomUUID)(), {
                firstName: command.firstName,
                lastName: command.lastName,
                source: command.source,
                companyName: command.companyName,
                designation: command.designation,
                department: command.department,
                notes: command.notes,
                createdById: command.createdById,
            });
            const withEvents = this.publisher.mergeObjectContext(rawContact);
            await this.repo.save(withEvents);
            if (command.communications?.length) {
                const seenTypes = new Set();
                for (const comm of command.communications) {
                    const isFirstOfType = !seenTypes.has(comm.type);
                    seenTypes.add(comm.type);
                    await this.prisma.working.communication.create({
                        data: {
                            type: comm.type,
                            value: comm.value,
                            priorityType: comm.priorityType || 'PRIMARY',
                            label: comm.label,
                            isPrimary: comm.isPrimary ?? isFirstOfType,
                            rawContactId: rawContact.id,
                        },
                    });
                }
            }
            if (command.filterIds?.length) {
                await this.prisma.working.rawContactFilter.createMany({
                    data: command.filterIds.map(fid => ({
                        rawContactId: rawContact.id,
                        lookupValueId: fid,
                    })),
                    skipDuplicates: true,
                });
            }
            withEvents.commit();
            this.logger.log(`RawContact created: ${rawContact.id} (${rawContact.fullName})`);
            return rawContact.id;
        }
        catch (error) {
            this.logger.error(`CreateRawContactHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.CreateRawContactHandler = CreateRawContactHandler;
exports.CreateRawContactHandler = CreateRawContactHandler = CreateRawContactHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(create_raw_contact_command_1.CreateRawContactCommand),
    __param(0, (0, common_1.Inject)(raw_contact_repository_interface_1.RAW_CONTACT_REPOSITORY)),
    __metadata("design:paramtypes", [Object, cqrs_1.EventPublisher,
        prisma_service_1.PrismaService])
], CreateRawContactHandler);
//# sourceMappingURL=create-raw-contact.handler.js.map