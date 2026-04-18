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
var GetWorkflowStatsHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetWorkflowStatsHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const get_workflow_stats_query_1 = require("./get-workflow-stats.query");
let GetWorkflowStatsHandler = GetWorkflowStatsHandler_1 = class GetWorkflowStatsHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetWorkflowStatsHandler_1.name);
    }
    async execute(query) {
        try {
            const where = {};
            if (query.entityType)
                where.entityType = query.entityType;
            const [totalWorkflows, activeInstances, completedInstances, pendingApprovals, slaBreaches] = await Promise.all([
                this.prisma.workflow.count({ where: { ...where, isActive: true } }),
                this.prisma.workflowInstance.count({ where: { ...where, isActive: true } }),
                this.prisma.workflowInstance.count({ where: { ...where, isActive: false } }),
                this.prisma.workflowApproval.count({ where: { status: 'PENDING' } }),
                this.prisma.workflowSlaEscalation.count({ where: { isResolved: false } }),
            ]);
            const instancesByState = await this.prisma.workflowInstance.groupBy({
                by: ['currentStateId'],
                where: { isActive: true, ...where },
                _count: true,
            });
            return {
                totalWorkflows,
                activeInstances,
                completedInstances,
                pendingApprovals,
                slaBreaches,
                instancesByState,
            };
        }
        catch (error) {
            this.logger.error(`GetWorkflowStatsHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetWorkflowStatsHandler = GetWorkflowStatsHandler;
exports.GetWorkflowStatsHandler = GetWorkflowStatsHandler = GetWorkflowStatsHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_workflow_stats_query_1.GetWorkflowStatsQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetWorkflowStatsHandler);
//# sourceMappingURL=get-workflow-stats.handler.js.map