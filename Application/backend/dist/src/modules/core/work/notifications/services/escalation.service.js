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
var EscalationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EscalationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const channel_router_service_1 = require("./channel-router.service");
const error_utils_1 = require("../../../../../common/utils/error.utils");
let EscalationService = EscalationService_1 = class EscalationService {
    constructor(prisma, channelRouter) {
        this.prisma = prisma;
        this.channelRouter = channelRouter;
        this.logger = new common_1.Logger(EscalationService_1.name);
    }
    async processEscalations() {
        const rules = await this.prisma.escalationRule.findMany({
            where: { isActive: true, entityType: 'task' },
        });
        if (rules.length === 0)
            return 0;
        let escalated = 0;
        for (const rule of rules) {
            const thresholdDate = new Date(Date.now() - rule.triggerAfterHours * 60 * 60 * 1000);
            const overdueTasks = await this.prisma.task.findMany({
                where: {
                    isActive: true,
                    status: { in: ['OVERDUE', 'OPEN', 'IN_PROGRESS'] },
                    dueDate: { lt: thresholdDate },
                },
                include: {
                    assignedTo: {
                        select: { id: true, firstName: true, lastName: true, reportingToId: true, roleId: true },
                    },
                },
                take: 50,
            });
            for (const task of overdueTasks) {
                try {
                    await this.executeAction(rule, task);
                    escalated++;
                }
                catch (error) {
                    this.logger.error(`Escalation failed for task ${task.id}: ${(0, error_utils_1.getErrorMessage)(error)}`);
                }
            }
        }
        return escalated;
    }
    async executeAction(rule, task) {
        switch (rule.action) {
            case 'NOTIFY_MANAGER':
                if (task.assignedTo?.reportingToId) {
                    await this.channelRouter.send({
                        templateName: 'task_overdue',
                        recipientId: task.assignedTo.reportingToId,
                        variables: {
                            taskTitle: task.title,
                            taskNumber: task.taskNumber,
                            dueDate: task.dueDate?.toISOString() || 'N/A',
                            assigneeName: `${task.assignedTo.firstName} ${task.assignedTo.lastName}`,
                        },
                        entityType: 'task',
                        entityId: task.id,
                        priority: 'HIGH',
                    });
                }
                break;
            case 'REASSIGN':
                if (task.assignedTo?.reportingToId) {
                    await this.prisma.task.update({
                        where: { id: task.id },
                        data: { assignedToId: task.assignedTo.reportingToId },
                    });
                    await this.prisma.taskHistory.create({
                        data: {
                            taskId: task.id,
                            field: 'assignedToId',
                            oldValue: task.assignedToId,
                            newValue: task.assignedTo.reportingToId,
                            changedById: task.assignedTo.reportingToId,
                        },
                    });
                }
                break;
            case 'ESCALATE_UP':
                if (rule.targetRoleLevel != null) {
                    const targetUsers = await this.prisma.user.findMany({
                        where: { role: { level: { lte: rule.targetRoleLevel } }, isDeleted: false },
                        select: { id: true },
                        take: 5,
                    });
                    for (const target of targetUsers) {
                        await this.channelRouter.send({
                            templateName: 'task_overdue',
                            recipientId: target.id,
                            variables: {
                                taskTitle: task.title,
                                taskNumber: task.taskNumber,
                                dueDate: task.dueDate?.toISOString() || 'N/A',
                                assigneeName: `${task.assignedTo.firstName} ${task.assignedTo.lastName}`,
                            },
                            entityType: 'task',
                            entityId: task.id,
                            priority: 'URGENT',
                        });
                    }
                }
                break;
            case 'AUTO_CLOSE':
                await this.prisma.task.update({
                    where: { id: task.id },
                    data: { status: 'CANCELLED' },
                });
                await this.prisma.taskHistory.create({
                    data: {
                        taskId: task.id,
                        field: 'status',
                        oldValue: task.status,
                        newValue: 'CANCELLED',
                        changedById: task.createdById,
                    },
                });
                break;
        }
    }
    async getAllRules(tenantId = '') {
        return this.prisma.escalationRule.findMany({
            where: { tenantId },
            orderBy: { triggerAfterHours: 'asc' },
        });
    }
    async createRule(data, tenantId = '') {
        return this.prisma.escalationRule.create({
            data: { tenantId, entityType: data.entityType, triggerAfterHours: data.triggerAfterHours, action: data.action, targetRoleLevel: data.targetRoleLevel },
        });
    }
    async updateRule(id, data) {
        return this.prisma.escalationRule.update({
            where: { id },
            data: { ...data, action: data.action },
        });
    }
    async deleteRule(id) {
        return this.prisma.escalationRule.delete({ where: { id } });
    }
};
exports.EscalationService = EscalationService;
exports.EscalationService = EscalationService = EscalationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        channel_router_service_1.ChannelRouterService])
], EscalationService);
//# sourceMappingURL=escalation.service.js.map