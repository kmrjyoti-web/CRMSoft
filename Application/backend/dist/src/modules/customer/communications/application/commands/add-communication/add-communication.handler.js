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
var AddCommunicationHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddCommunicationHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const add_communication_command_1 = require("./add-communication.command");
const communication_entity_1 = require("../../../domain/entities/communication.entity");
const communication_repository_interface_1 = require("../../../domain/interfaces/communication-repository.interface");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let AddCommunicationHandler = AddCommunicationHandler_1 = class AddCommunicationHandler {
    constructor(repo, publisher, prisma) {
        this.repo = repo;
        this.publisher = publisher;
        this.prisma = prisma;
        this.logger = new common_1.Logger(AddCommunicationHandler_1.name);
    }
    async execute(command) {
        try {
            const comm = communication_entity_1.CommunicationEntity.create((0, crypto_1.randomUUID)(), {
                type: command.type,
                value: command.value,
                priorityType: command.priorityType,
                isPrimary: command.isPrimary,
                label: command.label,
                rawContactId: command.rawContactId,
                contactId: command.contactId,
                organizationId: command.organizationId,
                leadId: command.leadId,
            });
            if (command.isPrimary) {
                await this.unsetExistingPrimary(command);
            }
            const withEvents = this.publisher.mergeObjectContext(comm);
            await this.repo.save(withEvents);
            withEvents.commit();
            this.logger.log(`Communication added: ${command.type} = ${command.value}`);
            return comm.id;
        }
        catch (error) {
            this.logger.error(`AddCommunicationHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
    async unsetExistingPrimary(cmd) {
        const where = { type: cmd.type, isPrimary: true };
        if (cmd.contactId)
            where.contactId = cmd.contactId;
        else if (cmd.rawContactId)
            where.rawContactId = cmd.rawContactId;
        else if (cmd.organizationId)
            where.organizationId = cmd.organizationId;
        else if (cmd.leadId)
            where.leadId = cmd.leadId;
        await this.prisma.working.communication.updateMany({
            where,
            data: { isPrimary: false },
        });
    }
};
exports.AddCommunicationHandler = AddCommunicationHandler;
exports.AddCommunicationHandler = AddCommunicationHandler = AddCommunicationHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(add_communication_command_1.AddCommunicationCommand),
    __param(0, (0, common_1.Inject)(communication_repository_interface_1.COMMUNICATION_REPOSITORY)),
    __metadata("design:paramtypes", [Object, cqrs_1.EventPublisher,
        prisma_service_1.PrismaService])
], AddCommunicationHandler);
//# sourceMappingURL=add-communication.handler.js.map