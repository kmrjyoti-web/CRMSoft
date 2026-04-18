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
var UpdateCommunicationHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCommunicationHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const update_communication_command_1 = require("./update-communication.command");
const communication_repository_interface_1 = require("../../../domain/interfaces/communication-repository.interface");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let UpdateCommunicationHandler = UpdateCommunicationHandler_1 = class UpdateCommunicationHandler {
    constructor(repo, prisma) {
        this.repo = repo;
        this.prisma = prisma;
        this.logger = new common_1.Logger(UpdateCommunicationHandler_1.name);
    }
    async execute(command) {
        try {
            const comm = await this.repo.findById(command.communicationId);
            if (!comm)
                throw new common_1.NotFoundException(`Communication ${command.communicationId} not found`);
            const updateData = {};
            if (command.data.value !== undefined)
                updateData.value = command.data.value;
            if (command.data.priorityType !== undefined)
                updateData.priorityType = command.data.priorityType;
            if (command.data.label !== undefined)
                updateData.label = command.data.label;
            if (Object.keys(updateData).length === 0) {
                throw new Error('No fields provided to update');
            }
            await this.prisma.working.communication.update({
                where: { id: command.communicationId },
                data: updateData,
            });
            this.logger.log(`Communication ${command.communicationId} updated`);
        }
        catch (error) {
            this.logger.error(`UpdateCommunicationHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.UpdateCommunicationHandler = UpdateCommunicationHandler;
exports.UpdateCommunicationHandler = UpdateCommunicationHandler = UpdateCommunicationHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(update_communication_command_1.UpdateCommunicationCommand),
    __param(0, (0, common_1.Inject)(communication_repository_interface_1.COMMUNICATION_REPOSITORY)),
    __metadata("design:paramtypes", [Object, prisma_service_1.PrismaService])
], UpdateCommunicationHandler);
//# sourceMappingURL=update-communication.handler.js.map