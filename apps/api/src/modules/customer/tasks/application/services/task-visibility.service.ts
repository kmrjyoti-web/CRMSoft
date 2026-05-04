import { Injectable } from '@nestjs/common';
import { TaskAssignmentService } from './task-assignment.service';

interface VisibilityContext {
  userId: string;
  roleLevel: number;
  tenantId: string;
  departmentId?: string;
}

/**
 * Builds Prisma `where` clauses for task visibility.
 *
 * Rules:
 * - Admin (0-1): sees all tasks in tenant
 * - Manager (2-3): sees own tasks + created + watched + reportee tasks + department tasks
 * - User (4-6): sees own tasks + created + watched
 */
@Injectable()
export class TaskVisibilityService {
  constructor(private readonly assignmentService: TaskAssignmentService) {}

  async buildWhereClause(ctx: VisibilityContext) {
    const base = { tenantId: ctx.tenantId, isActive: true };

    // Admin sees everything
    if (ctx.roleLevel <= 1) {
      return base;
    }

    const orConditions: any[] = [
      { assignedToId: ctx.userId },
      { createdById: ctx.userId },
      { watchers: { some: { userId: ctx.userId } } },
    ];

    // Manager also sees reportee tasks + department tasks
    if (ctx.roleLevel <= 3) {
      const reporteeIds = await this.assignmentService.getReporteeIds(ctx.userId);
      if (reporteeIds.length > 0) {
        orConditions.push({ assignedToId: { in: reporteeIds } });
      }
      if (ctx.departmentId) {
        orConditions.push({ assignedDepartmentId: ctx.departmentId });
      }
    }

    return { ...base, OR: orConditions };
  }

  /** Get all user IDs that report to this manager (recursive). */
  async getReportingUserIds(managerId: string): Promise<string[]> {
    return this.assignmentService.getReporteeIds(managerId);
  }
}
