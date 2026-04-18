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
var AllocateLeadHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllocateLeadHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const allocate_lead_command_1 = require("./allocate-lead.command");
const lead_repository_interface_1 = require("../../../domain/interfaces/lead-repository.interface");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let AllocateLeadHandler = AllocateLeadHandler_1 = class AllocateLeadHandler {
    constructor(repo, publisher, prisma) {
        this.repo = repo;
        this.publisher = publisher;
        this.prisma = prisma;
        this.logger = new common_1.Logger(AllocateLeadHandler_1.name);
    }
    async execute(command) {
        try {
            const lead = await this.repo.findById(command.leadId);
            if (!lead)
                throw new common_1.NotFoundException(`Lead ${command.leadId} not found`);
            const user = await this.prisma.user.findUnique({
                where: { id: command.allocatedToId },
                select: { id: true, status: true },
            });
            if (!user)
                throw new common_1.NotFoundException(`User ${command.allocatedToId} not found`);
            if (user.status !== 'ACTIVE')
                throw new Error('Cannot allocate to inactive user');
            const withEvents = this.publisher.mergeObjectContext(lead);
            withEvents.allocate(command.allocatedToId);
            await this.repo.save(withEvents);
            withEvents.commit();
            this.logger.log(`Lead ${lead.leadNumber} allocated to ${command.allocatedToId}`);
        }
        catch (error) {
            this.logger.error(`AllocateLeadHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.AllocateLeadHandler = AllocateLeadHandler;
exports.AllocateLeadHandler = AllocateLeadHandler = AllocateLeadHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(allocate_lead_command_1.AllocateLeadCommand),
    __param(0, (0, common_1.Inject)(lead_repository_interface_1.LEAD_REPOSITORY)),
    __metadata("design:paramtypes", [Object, cqrs_1.EventPublisher,
        prisma_service_1.PrismaService])
], AllocateLeadHandler);
//# sourceMappingURL=allocate-lead.handler.js.map