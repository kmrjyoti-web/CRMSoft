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
var GetApprovalHistoryHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetApprovalHistoryHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const get_approval_history_query_1 = require("./get-approval-history.query");
let GetApprovalHistoryHandler = GetApprovalHistoryHandler_1 = class GetApprovalHistoryHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetApprovalHistoryHandler_1.name);
    }
    async execute(query) {
        try {
            const where = { status: { not: 'PENDING' } };
            if (query.userId) {
                where.OR = [{ requestedById: query.userId }, { approvedById: query.userId }];
            }
            return this.prisma.workflowApproval.findMany({
                where,
                include: {
                    instance: {
                        select: { id: true, entityType: true, entityId: true, workflow: { select: { name: true } } },
                    },
                    transition: { select: { id: true, name: true, code: true } },
                },
                orderBy: { decidedAt: 'desc' },
                take: 50,
            });
        }
        catch (error) {
            this.logger.error(`GetApprovalHistoryHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetApprovalHistoryHandler = GetApprovalHistoryHandler;
exports.GetApprovalHistoryHandler = GetApprovalHistoryHandler = GetApprovalHistoryHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_approval_history_query_1.GetApprovalHistoryQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetApprovalHistoryHandler);
//# sourceMappingURL=get-approval-history.handler.js.map