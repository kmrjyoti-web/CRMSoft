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
var GetLeadByIdHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetLeadByIdHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const get_lead_by_id_query_1 = require("./get-lead-by-id.query");
let GetLeadByIdHandler = GetLeadByIdHandler_1 = class GetLeadByIdHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetLeadByIdHandler_1.name);
    }
    async execute(query) {
        try {
            const lead = await this.prisma.working.lead.findUnique({
                where: { id: query.leadId },
                include: {
                    contact: {
                        select: {
                            id: true, firstName: true, lastName: true,
                            designation: true, isActive: true,
                            communications: {
                                where: { isPrimary: true },
                                select: { id: true, type: true, value: true },
                                take: 3,
                            },
                        },
                    },
                    organization: {
                        select: {
                            id: true, name: true, city: true, industry: true,
                        },
                    },
                    filters: {
                        select: {
                            id: true,
                            lookupValueId: true,
                        },
                    },
                    activities: {
                        select: {
                            id: true, type: true, subject: true,
                            outcome: true, completedAt: true, scheduledAt: true,
                        },
                        orderBy: { createdAt: 'desc' },
                        take: 10,
                    },
                    demos: {
                        select: {
                            id: true, mode: true, status: true,
                            scheduledAt: true, completedAt: true,
                        },
                        orderBy: { scheduledAt: 'desc' },
                        take: 5,
                    },
                    quotations: {
                        select: {
                            id: true, quotationNo: true, status: true,
                            totalAmount: true, validUntil: true,
                        },
                        orderBy: { createdAt: 'desc' },
                        take: 5,
                    },
                    _count: {
                        select: { activities: true, demos: true, quotations: true },
                    },
                },
            });
            if (!lead)
                throw new common_1.NotFoundException(`Lead ${query.leadId} not found`);
            const { LeadStatus } = await Promise.resolve().then(() => require('../../../domain/value-objects/lead-status.vo'));
            const currentStatus = LeadStatus.fromString(lead.status);
            return {
                ...lead,
                validNextStatuses: currentStatus.validTransitions(),
                isTerminal: currentStatus.isTerminal(),
            };
        }
        catch (error) {
            this.logger.error(`GetLeadByIdHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetLeadByIdHandler = GetLeadByIdHandler;
exports.GetLeadByIdHandler = GetLeadByIdHandler = GetLeadByIdHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_lead_by_id_query_1.GetLeadByIdQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetLeadByIdHandler);
//# sourceMappingURL=get-lead-by-id.handler.js.map