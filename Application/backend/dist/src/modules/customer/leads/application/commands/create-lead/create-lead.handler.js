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
var CreateLeadHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateLeadHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const create_lead_command_1 = require("./create-lead.command");
const lead_entity_1 = require("../../../domain/entities/lead.entity");
const lead_repository_interface_1 = require("../../../domain/interfaces/lead-repository.interface");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const workflow_engine_service_1 = require("../../../../../../core/workflow/workflow-engine.service");
let CreateLeadHandler = CreateLeadHandler_1 = class CreateLeadHandler {
    constructor(repo, publisher, prisma, workflowEngine) {
        this.repo = repo;
        this.publisher = publisher;
        this.prisma = prisma;
        this.workflowEngine = workflowEngine;
        this.logger = new common_1.Logger(CreateLeadHandler_1.name);
    }
    async execute(command) {
        const contact = await this.prisma.working.contact.findUnique({
            where: { id: command.contactId },
            select: { id: true, isActive: true },
        });
        if (!contact) {
            throw new common_1.NotFoundException(`Contact ${command.contactId} not found`);
        }
        if (!contact.isActive) {
            throw new Error('Cannot create lead for deactivated contact');
        }
        if (command.organizationId) {
            const org = await this.prisma.working.organization.findUnique({
                where: { id: command.organizationId },
                select: { id: true },
            });
            if (!org) {
                throw new common_1.NotFoundException(`Organization ${command.organizationId} not found`);
            }
        }
        const lead = await this.prisma.$transaction(async (tx) => {
            const leadNumber = await this.repo.nextLeadNumber(tx);
            const entity = lead_entity_1.LeadEntity.create((0, crypto_1.randomUUID)(), {
                leadNumber,
                contactId: command.contactId,
                organizationId: command.organizationId,
                priority: command.priority || 'MEDIUM',
                expectedValue: command.expectedValue,
                expectedCloseDate: command.expectedCloseDate,
                notes: command.notes,
                createdById: command.createdById,
            });
            await this.repo.save(entity, tx);
            if (command.filterIds?.length) {
                await tx.leadFilter.createMany({
                    data: command.filterIds.map(fid => ({
                        leadId: entity.id,
                        lookupValueId: fid,
                    })),
                    skipDuplicates: true,
                });
            }
            return entity;
        });
        const withEvents = this.publisher.mergeObjectContext(lead);
        withEvents.commit();
        try {
            await this.workflowEngine.initializeWorkflow('LEAD', lead.id, command.createdById);
        }
        catch (e) {
            this.logger.warn(`Workflow init skipped for lead ${lead.id}: ${e.message}`);
        }
        this.logger.log(`Lead created: ${lead.leadNumber} for contact ${command.contactId}`);
        return lead.id;
    }
};
exports.CreateLeadHandler = CreateLeadHandler;
exports.CreateLeadHandler = CreateLeadHandler = CreateLeadHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(create_lead_command_1.CreateLeadCommand),
    __param(0, (0, common_1.Inject)(lead_repository_interface_1.LEAD_REPOSITORY)),
    __metadata("design:paramtypes", [Object, cqrs_1.EventPublisher,
        prisma_service_1.PrismaService,
        workflow_engine_service_1.WorkflowEngineService])
], CreateLeadHandler);
//# sourceMappingURL=create-lead.handler.js.map