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
var SetPrimaryHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetPrimaryHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const set_primary_command_1 = require("./set-primary.command");
const communication_repository_interface_1 = require("../../../domain/interfaces/communication-repository.interface");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let SetPrimaryHandler = SetPrimaryHandler_1 = class SetPrimaryHandler {
    constructor(repo, prisma) {
        this.repo = repo;
        this.prisma = prisma;
        this.logger = new common_1.Logger(SetPrimaryHandler_1.name);
    }
    async execute(command) {
        try {
            const comm = await this.repo.findById(command.communicationId);
            if (!comm)
                throw new common_1.NotFoundException(`Communication ${command.communicationId} not found`);
            if (comm.isPrimary)
                return;
            const where = { type: comm.type.value, isPrimary: true };
            if (comm.contactId)
                where.contactId = comm.contactId;
            else if (comm.rawContactId)
                where.rawContactId = comm.rawContactId;
            else if (comm.organizationId)
                where.organizationId = comm.organizationId;
            else if (comm.leadId)
                where.leadId = comm.leadId;
            await this.prisma.working.communication.updateMany({ where, data: { isPrimary: false } });
            await this.prisma.working.communication.update({
                where: { id: command.communicationId },
                data: { isPrimary: true },
            });
            this.logger.log(`Communication ${command.communicationId} set as primary`);
        }
        catch (error) {
            this.logger.error(`SetPrimaryHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.SetPrimaryHandler = SetPrimaryHandler;
exports.SetPrimaryHandler = SetPrimaryHandler = SetPrimaryHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(set_primary_command_1.SetPrimaryCommunicationCommand),
    __param(0, (0, common_1.Inject)(communication_repository_interface_1.COMMUNICATION_REPOSITORY)),
    __metadata("design:paramtypes", [Object, prisma_service_1.PrismaService])
], SetPrimaryHandler);
//# sourceMappingURL=set-primary.handler.js.map