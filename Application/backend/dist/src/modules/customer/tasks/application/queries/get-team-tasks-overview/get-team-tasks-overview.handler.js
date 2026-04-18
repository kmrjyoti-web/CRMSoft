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
var GetTeamTasksOverviewHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTeamTasksOverviewHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_team_tasks_overview_query_1 = require("./get-team-tasks-overview.query");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const task_assignment_service_1 = require("../../services/task-assignment.service");
let GetTeamTasksOverviewHandler = GetTeamTasksOverviewHandler_1 = class GetTeamTasksOverviewHandler {
    constructor(prisma, assignmentService) {
        this.prisma = prisma;
        this.assignmentService = assignmentService;
        this.logger = new common_1.Logger(GetTeamTasksOverviewHandler_1.name);
    }
    async execute(query) {
        try {
            if (query.roleLevel > 3) {
                throw new common_1.ForbiddenException('Only managers and above can view team task overview');
            }
            const reporteeIds = await this.assignmentService.getReporteeIds(query.userId);
            const teamUserIds = [query.userId, ...reporteeIds];
            const now = new Date();
            const dayOfWeek = now.getDay();
            const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
            const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday, 0, 0, 0, 0);
            const users = await this.prisma.user.findMany({
                where: { id: { in: teamUserIds }, isDeleted: false },
                select: { id: true, firstName: true, lastName: true },
            });
            const overview = await Promise.all(users.map(async (user) => {
                const baseWhere = {
                    assignedToId: user.id,
                    tenantId: query.tenantId,
                    isActive: true,
                };
                const [pending, inProgress, overdue, onHold, completedThisWeek] = await Promise.all([
                    this.prisma.working.task.count({ where: { ...baseWhere, status: 'OPEN' } }),
                    this.prisma.working.task.count({ where: { ...baseWhere, status: 'IN_PROGRESS' } }),
                    this.prisma.working.task.count({
                        where: {
                            ...baseWhere,
                            status: { in: ['OPEN', 'IN_PROGRESS'] },
                            dueDate: { lt: now },
                        },
                    }),
                    this.prisma.working.task.count({ where: { ...baseWhere, status: 'ON_HOLD' } }),
                    this.prisma.working.task.count({
                        where: {
                            ...baseWhere,
                            status: 'COMPLETED',
                            completedAt: { gte: startOfWeek },
                        },
                    }),
                ]);
                return {
                    userId: user.id,
                    userName: `${user.firstName} ${user.lastName}`.trim(),
                    pending,
                    inProgress,
                    overdue,
                    onHold,
                    completedThisWeek,
                };
            }));
            return overview;
        }
        catch (error) {
            this.logger.error(`GetTeamTasksOverviewHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetTeamTasksOverviewHandler = GetTeamTasksOverviewHandler;
exports.GetTeamTasksOverviewHandler = GetTeamTasksOverviewHandler = GetTeamTasksOverviewHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_team_tasks_overview_query_1.GetTeamTasksOverviewQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        task_assignment_service_1.TaskAssignmentService])
], GetTeamTasksOverviewHandler);
//# sourceMappingURL=get-team-tasks-overview.handler.js.map