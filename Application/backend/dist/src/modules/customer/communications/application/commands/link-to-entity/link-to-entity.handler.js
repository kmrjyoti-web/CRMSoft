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
var LinkToEntityHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkToEntityHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const link_to_entity_command_1 = require("./link-to-entity.command");
const communication_repository_interface_1 = require("../../../domain/interfaces/communication-repository.interface");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let LinkToEntityHandler = LinkToEntityHandler_1 = class LinkToEntityHandler {
    constructor(repo, prisma) {
        this.repo = repo;
        this.prisma = prisma;
        this.logger = new common_1.Logger(LinkToEntityHandler_1.name);
    }
    async execute(command) {
        try {
            const comm = await this.repo.findById(command.communicationId);
            if (!comm)
                throw new common_1.NotFoundException(`Communication ${command.communicationId} not found`);
            const updateData = {};
            switch (command.entityType) {
                case 'contact':
                    updateData.contactId = command.entityId;
                    break;
                case 'organization':
                    updateData.organizationId = command.entityId;
                    break;
                case 'lead':
                    updateData.leadId = command.entityId;
                    break;
                default: throw new Error(`Invalid entity type: ${command.entityType}`);
            }
            await this.prisma.working.communication.update({
                where: { id: command.communicationId },
                data: updateData,
            });
            this.logger.log(`Communication ${command.communicationId} linked to ${command.entityType}:${command.entityId}`);
        }
        catch (error) {
            this.logger.error(`LinkToEntityHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.LinkToEntityHandler = LinkToEntityHandler;
exports.LinkToEntityHandler = LinkToEntityHandler = LinkToEntityHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(link_to_entity_command_1.LinkToEntityCommand),
    __param(0, (0, common_1.Inject)(communication_repository_interface_1.COMMUNICATION_REPOSITORY)),
    __metadata("design:paramtypes", [Object, prisma_service_1.PrismaService])
], LinkToEntityHandler);
//# sourceMappingURL=link-to-entity.handler.js.map