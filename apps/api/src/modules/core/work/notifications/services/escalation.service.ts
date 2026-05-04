// @ts-nocheck
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { ChannelRouterService } from './channel-router.service';
import { getErrorMessage } from '@/common/utils/error.utils';

@Injectable()
export class EscalationService {
  private readonly logger = new Logger(EscalationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly channelRouter: ChannelRouterService,
  ) {}

  /** Process escalation rules for overdue tasks. Called by cron handler. */
  async processEscalations(): Promise<number> {
    const rules = await this.prisma.escalationRule.findMany({
      where: { isActive: true, entityType: 'task' },
    });

    if (rules.length === 0) return 0;

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
        } catch (error) {
          this.logger.error(`Escalation failed for task ${task.id}: ${getErrorMessage(error)}`);
        }
      }
    }

    return escalated;
  }

  private async executeAction(rule: any, task: any) {
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
              changedById: task.assignedTo.reportingToId, // system escalation
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
            changedById: task.createdById, // system action
          },
        });
        break;
    }
  }

  // --- CRUD for escalation rules ---

  async getAllRules(tenantId = '') {
    return this.prisma.escalationRule.findMany({
      where: { tenantId },
      orderBy: { triggerAfterHours: 'asc' },
    });
  }

  async createRule(data: { entityType: string; triggerAfterHours: number; action: string; targetRoleLevel?: number }, tenantId = '') {
    return this.prisma.escalationRule.create({
      data: { tenantId, entityType: data.entityType, triggerAfterHours: data.triggerAfterHours, action: data.action as any, targetRoleLevel: data.targetRoleLevel },
    });
  }

  async updateRule(id: string, data: { triggerAfterHours?: number; action?: string; targetRoleLevel?: number; isActive?: boolean }) {
    return this.prisma.escalationRule.update({
      where: { id },
      data: { ...data, action: data.action as any },
    });
  }

  async deleteRule(id: string) {
    return this.prisma.escalationRule.delete({ where: { id } });
  }
}
