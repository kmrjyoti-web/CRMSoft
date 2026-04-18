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
var GetMyTasksDashboardHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetMyTasksDashboardHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_my_tasks_dashboard_query_1 = require("./get-my-tasks-dashboard.query");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let GetMyTasksDashboardHandler = GetMyTasksDashboardHandler_1 = class GetMyTasksDashboardHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetMyTasksDashboardHandler_1.name);
    }
    async execute(query) {
        try {
            const now = new Date();
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
            const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
            const baseWhere = {
                assignedToId: query.userId,
                tenantId: query.tenantId,
                isActive: true,
            };
            const [overdue, dueToday, upcoming, recentlyCompleted] = await Promise.all([
                this.prisma.working.task.findMany({
                    where: {
                        ...baseWhere,
                        status: { in: ['OPEN', 'IN_PROGRESS'] },
                        dueDate: { lt: now },
                    },
                    orderBy: { dueDate: 'asc' },
                    include: {
                        createdBy: { select: { id: true, firstName: true, lastName: true } },
                    },
                }),
                this.prisma.working.task.findMany({
                    where: {
                        ...baseWhere,
                        status: { notIn: ['COMPLETED', 'CANCELLED'] },
                        dueDate: { gte: startOfDay, lte: endOfDay },
                    },
                    orderBy: { dueDate: 'asc' },
                    include: {
                        createdBy: { select: { id: true, firstName: true, lastName: true } },
                    },
                }),
                this.prisma.working.task.findMany({
                    where: {
                        ...baseWhere,
                        status: { notIn: ['COMPLETED', 'CANCELLED'] },
                        dueDate: { gt: endOfDay },
                    },
                    orderBy: { dueDate: 'asc' },
                    take: 10,
                    include: {
                        createdBy: { select: { id: true, firstName: true, lastName: true } },
                    },
                }),
                this.prisma.working.task.findMany({
                    where: {
                        ...baseWhere,
                        status: 'COMPLETED',
                    },
                    orderBy: { completedAt: 'desc' },
                    take: 10,
                    include: {
                        createdBy: { select: { id: true, firstName: true, lastName: true } },
                    },
                }),
            ]);
            return {
                overdue,
                dueToday,
                upcoming,
                recentlyCompleted,
                counts: {
                    overdue: overdue.length,
                    dueToday: dueToday.length,
                    upcoming: upcoming.length,
                    completed: recentlyCompleted.length,
                },
            };
        }
        catch (error) {
            this.logger.error(`GetMyTasksDashboardHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetMyTasksDashboardHandler = GetMyTasksDashboardHandler;
exports.GetMyTasksDashboardHandler = GetMyTasksDashboardHandler = GetMyTasksDashboardHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_my_tasks_dashboard_query_1.GetMyTasksDashboardQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetMyTasksDashboardHandler);
//# sourceMappingURL=get-my-tasks-dashboard.handler.js.map