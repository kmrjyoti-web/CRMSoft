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
var GetPendingApprovalsHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetPendingApprovalsHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const get_pending_approvals_query_1 = require("./get-pending-approvals.query");
let GetPendingApprovalsHandler = GetPendingApprovalsHandler_1 = class GetPendingApprovalsHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetPendingApprovalsHandler_1.name);
    }
    async execute(query) {
        try {
            return this.prisma.workflowApproval.findMany({
                where: { status: 'PENDING' },
                include: {
                    instance: {
                        select: { id: true, entityType: true, entityId: true, workflow: { select: { name: true } } },
                    },
                    transition: {
                        select: { id: true, name: true, code: true, toState: { select: { name: true, code: true } } },
                    },
                },
                orderBy: { createdAt: 'desc' },
            });
        }
        catch (error) {
            this.logger.error(`GetPendingApprovalsHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetPendingApprovalsHandler = GetPendingApprovalsHandler;
exports.GetPendingApprovalsHandler = GetPendingApprovalsHandler = GetPendingApprovalsHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_pending_approvals_query_1.GetPendingApprovalsQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetPendingApprovalsHandler);
//# sourceMappingURL=get-pending-approvals.handler.js.map