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
var GetTaskStatsHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTaskStatsHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_task_stats_query_1 = require("./get-task-stats.query");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const task_visibility_service_1 = require("../../services/task-visibility.service");
let GetTaskStatsHandler = GetTaskStatsHandler_1 = class GetTaskStatsHandler {
    constructor(prisma, visibility) {
        this.prisma = prisma;
        this.visibility = visibility;
        this.logger = new common_1.Logger(GetTaskStatsHandler_1.name);
    }
    async execute(query) {
        try {
            const where = await this.visibility.buildWhereClause({
                userId: query.userId,
                roleLevel: query.roleLevel,
                tenantId: query.tenantId,
            });
            const [total, open, inProgress, completed, overdue, cancelled, onHold] = await Promise.all([
                this.prisma.working.task.count({ where }),
                this.prisma.working.task.count({ where: { ...where, status: 'OPEN' } }),
                this.prisma.working.task.count({ where: { ...where, status: 'IN_PROGRESS' } }),
                this.prisma.working.task.count({ where: { ...where, status: 'COMPLETED' } }),
                this.prisma.working.task.count({ where: { ...where, status: 'OVERDUE' } }),
                this.prisma.working.task.count({ where: { ...where, status: 'CANCELLED' } }),
                this.prisma.working.task.count({ where: { ...where, status: 'ON_HOLD' } }),
            ]);
            return { total, open, inProgress, completed, overdue, cancelled, onHold };
        }
        catch (error) {
            this.logger.error(`GetTaskStatsHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetTaskStatsHandler = GetTaskStatsHandler;
exports.GetTaskStatsHandler = GetTaskStatsHandler = GetTaskStatsHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_task_stats_query_1.GetTaskStatsQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        task_visibility_service_1.TaskVisibilityService])
], GetTaskStatsHandler);
//# sourceMappingURL=get-task-stats.handler.js.map