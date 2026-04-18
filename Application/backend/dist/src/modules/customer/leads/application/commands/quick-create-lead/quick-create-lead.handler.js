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
var QuickCreateLeadHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuickCreateLeadHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const quick_create_lead_command_1 = require("./quick-create-lead.command");
const lead_entity_1 = require("../../../domain/entities/lead.entity");
const lead_repository_interface_1 = require("../../../domain/interfaces/lead-repository.interface");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const workflow_engine_service_1 = require("../../../../../../core/workflow/workflow-engine.service");
let QuickCreateLeadHandler = QuickCreateLeadHandler_1 = class QuickCreateLeadHandler {
    constructor(repo, publisher, prisma, workflowEngine) {
        this.repo = repo;
        this.publisher = publisher;
        this.prisma = prisma;
        this.workflowEngine = workflowEngine;
        this.logger = new common_1.Logger(QuickCreateLeadHandler_1.name);
    }
    async execute(command) {
        if (!command.contactId && !command.inlineContact) {
            throw new common_1.BadRequestException('Either contactId or inlineContact is required');
        }
        if (command.contactId && !command.inlineContact) {
            const contact = await this.prisma.working.contact.findUnique({
                where: { id: command.contactId },
                select: { id: true, isActive: true },
            });
            if (!contact)
                throw new common_1.NotFoundException(`Contact ${command.contactId} not found`);
            if (!contact.isActive)
                throw new common_1.BadRequestException('Cannot create lead for deactivated contact');
        }
        if (command.organizationId && !command.inlineOrganization) {
            const org = await this.prisma.working.organization.findUnique({
                where: { id: command.organizationId },
                select: { id: true },
            });
            if (!org)
                throw new common_1.NotFoundException(`Organization ${command.organizationId} not found`);
        }
        const result = await this.prisma.$transaction(async (tx) => {
            let orgId = command.organizationId;
            let contactId = command.contactId;
            let rawContactId;
            if (command.inlineOrganization) {
                const orgName = command.inlineOrganization.name.trim();
                const existing = await tx.organization.findFirst({
                    where: { name: orgName },
                    select: { id: true },
                });
                if (existing) {
                    orgId = existing.id;
                }
                else {
                    const newOrg = await tx.organization.create({
                        data: {
                            id: (0, crypto_1.randomUUID)(),
                            name: orgName,
                            dataStatus: 'INCOMPLETE_DATA',
                            createdById: command.createdById,
                        },
                    });
                    orgId = newOrg.id;
                }
            }
            if (command.inlineContact) {
                const newContact = await tx.contact.create({
                    data: {
                        id: (0, crypto_1.randomUUID)(),
                        firstName: command.inlineContact.firstName.trim(),
                        lastName: command.inlineContact.lastName.trim(),
                        organizationId: orgId || null,
                        dataStatus: 'INCOMPLETE_DATA',
                        createdById: command.createdById,
                    },
                });
                contactId = newContact.id;
                await tx.communication.create({
                    data: {
                        id: (0, crypto_1.randomUUID)(),
                        type: 'MOBILE',
                        value: command.inlineContact.mobile.trim(),
                        priorityType: 'PRIMARY',
                        isPrimary: true,
                        contactId: newContact.id,
                    },
                });
                if (orgId) {
                    await tx.contactOrganization.create({
                        data: {
                            id: (0, crypto_1.randomUUID)(),
                            contactId: newContact.id,
                            organizationId: orgId,
                            relationType: 'EMPLOYEE',
                        },
                    });
                }
                const rawContact = await tx.rawContact.create({
                    data: {
                        id: (0, crypto_1.randomUUID)(),
                        firstName: command.inlineContact.firstName.trim(),
                        lastName: command.inlineContact.lastName.trim(),
                        companyName: command.inlineOrganization?.name?.trim() || null,
                        source: 'MANUAL',
                        status: 'RAW',
                        contactId: newContact.id,
                        createdById: command.createdById,
                    },
                });
                rawContactId = rawContact.id;
                await tx.communication.create({
                    data: {
                        id: (0, crypto_1.randomUUID)(),
                        type: 'MOBILE',
                        value: command.inlineContact.mobile.trim(),
                        priorityType: 'PRIMARY',
                        isPrimary: true,
                        rawContactId: rawContact.id,
                    },
                });
            }
            const leadNumber = await this.repo.nextLeadNumber(tx);
            const lead = lead_entity_1.LeadEntity.create((0, crypto_1.randomUUID)(), {
                leadNumber,
                contactId: contactId,
                organizationId: orgId,
                priority: command.priority || 'MEDIUM',
                expectedValue: command.expectedValue,
                expectedCloseDate: command.expectedCloseDate,
                notes: command.notes,
                createdById: command.createdById,
            });
            await this.repo.save(lead, tx);
            if (command.filterIds?.length) {
                await tx.leadFilter.createMany({
                    data: command.filterIds.map(fid => ({
                        leadId: lead.id,
                        lookupValueId: fid,
                    })),
                    skipDuplicates: true,
                });
            }
            return {
                lead,
                contactId: contactId,
                organizationId: orgId,
                rawContactId,
            };
        });
        const withEvents = this.publisher.mergeObjectContext(result.lead);
        withEvents.commit();
        this.logger.log(`Quick-created lead ${result.lead.leadNumber}` +
            (command.inlineContact ? ` with inline contact ${result.contactId}` : '') +
            (command.inlineOrganization ? ` and inline org ${result.organizationId}` : ''));
        try {
            await this.workflowEngine.initializeWorkflow('LEAD', result.lead.id, command.createdById);
        }
        catch (e) {
            this.logger.warn(`Workflow init skipped for lead ${result.lead.id}: ${e.message}`);
        }
        return {
            leadId: result.lead.id,
            contactId: result.contactId,
            organizationId: result.organizationId,
            rawContactId: result.rawContactId,
        };
    }
};
exports.QuickCreateLeadHandler = QuickCreateLeadHandler;
exports.QuickCreateLeadHandler = QuickCreateLeadHandler = QuickCreateLeadHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(quick_create_lead_command_1.QuickCreateLeadCommand),
    __param(0, (0, common_1.Inject)(lead_repository_interface_1.LEAD_REPOSITORY)),
    __metadata("design:paramtypes", [Object, cqrs_1.EventPublisher,
        prisma_service_1.PrismaService,
        workflow_engine_service_1.WorkflowEngineService])
], QuickCreateLeadHandler);
//# sourceMappingURL=quick-create-lead.handler.js.map