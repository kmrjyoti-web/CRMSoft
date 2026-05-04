import { Injectable } from '@nestjs/common';
import { TaskAssignmentService } from '../../../customer/tasks/application/services/task-assignment.service';

export interface CalendarVisibilityContext {
  userId: string;
  roleLevel: number;
  tenantId: string;
  departmentId?: string;
}

@Injectable()
export class CalendarVisibilityService {
  constructor(private readonly taskAssignment: TaskAssignmentService) {}

  /**
   * Build a Prisma-compatible where clause scoped by RBAC role level.
   * Admin (0-1): all events in tenant
   * Manager (2-3): own + reportee events
   * User (4-6): own events + events where they are a participant
   */
  async buildWhereClause(ctx: CalendarVisibilityContext): Promise<Record<string, unknown>> {
    const { userId, roleLevel, tenantId } = ctx;

    // Admin — see everything in the tenant
    if (roleLevel <= 1) {
      return { tenantId };
    }

    // Manager — own + reportees
    if (roleLevel <= 3) {
      const reporteeIds = await this.taskAssignment.getReporteeIds(userId);
      const visibleUserIds = [userId, ...reporteeIds];
      return { tenantId, organizerId: { in: visibleUserIds } };
    }

    // Regular user — own events + participant events
    return {
      tenantId,
      OR: [
        { organizerId: userId },
        { participants: { some: { userId } } },
      ],
    };
  }

  /**
   * Build a where clause for CalendarEvent (flat userId-based).
   */
  async buildCalendarEventWhere(ctx: CalendarVisibilityContext): Promise<Record<string, unknown>> {
    const { userId, roleLevel, tenantId } = ctx;

    if (roleLevel <= 1) {
      return { tenantId };
    }

    if (roleLevel <= 3) {
      const reporteeIds = await this.taskAssignment.getReporteeIds(userId);
      return { tenantId, userId: { in: [userId, ...reporteeIds] } };
    }

    return { tenantId, userId };
  }
}
