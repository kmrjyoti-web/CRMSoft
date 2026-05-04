// @ts-nocheck
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { TaskAssignmentService } from '../../../customer/tasks/application/services/task-assignment.service';
import { UnifiedCalendarEvent } from '../../../../common/interfaces/calendar-event.interface';

const SOURCE_COLORS: Record<string, string> = {
  TASK: '#4A90D9',
  ACTIVITY: '#27AE60',
  DEMO: '#E67E22',
  TOUR_PLAN: '#8E44AD',
  REMINDER: '#E74C3C',
  FOLLOW_UP: '#F39C12',
  SCHEDULED_EVENT: '#2C3E50',
  EXTERNAL_GOOGLE: '#4285F4',
  EXTERNAL_OUTLOOK: '#0078D4',
};

@Injectable()
export class UnifiedCalendarService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly taskAssignment: TaskAssignmentService,
  ) {}

  async getUnifiedView(
    userId: string,
    tenantId: string,
    roleLevel: number,
    startDate: Date,
    endDate: Date,
    sources?: string[],
    search?: string,
  ): Promise<UnifiedCalendarEvent[]> {
    const visibleUserIds = await this.getVisibleUserIds(userId, roleLevel, tenantId);
    const allSources = sources?.length ? sources : [
      'TASK', 'ACTIVITY', 'DEMO', 'TOUR_PLAN', 'REMINDER', 'FOLLOW_UP', 'SCHEDULED_EVENT',
    ];

    const fetchers: Promise<UnifiedCalendarEvent[]>[] = [];
    if (allSources.includes('TASK')) fetchers.push(this.fetchTasks(tenantId, visibleUserIds, startDate, endDate));
    if (allSources.includes('ACTIVITY')) fetchers.push(this.fetchActivities(tenantId, visibleUserIds, startDate, endDate));
    if (allSources.includes('DEMO')) fetchers.push(this.fetchDemos(tenantId, visibleUserIds, startDate, endDate));
    if (allSources.includes('TOUR_PLAN')) fetchers.push(this.fetchTourPlans(tenantId, visibleUserIds, startDate, endDate));
    if (allSources.includes('REMINDER')) fetchers.push(this.fetchReminders(tenantId, visibleUserIds, startDate, endDate));
    if (allSources.includes('FOLLOW_UP')) fetchers.push(this.fetchFollowUps(tenantId, visibleUserIds, startDate, endDate));
    if (allSources.includes('SCHEDULED_EVENT')) fetchers.push(this.fetchScheduledEvents(tenantId, userId, roleLevel, visibleUserIds, startDate, endDate));

    const results = (await Promise.all(fetchers)).flat();

    if (search) {
      const term = search.toLowerCase();
      return results.filter((e) => e.title.toLowerCase().includes(term) || e.description?.toLowerCase().includes(term));
    }

    return results.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }

  async getTeamView(
    userId: string, tenantId: string, roleLevel: number,
    startDate: Date, endDate: Date, teamUserIds?: string[],
  ): Promise<UnifiedCalendarEvent[]> {
    const visibleUserIds = teamUserIds?.length
      ? teamUserIds
      : await this.getVisibleUserIds(userId, roleLevel, tenantId);
    return this.getUnifiedView(userId, tenantId, roleLevel, startDate, endDate);
  }

  async getStats(userId: string, tenantId: string, roleLevel: number) {
    const now = new Date();
    const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now); todayEnd.setHours(23, 59, 59, 999);
    const weekEnd = new Date(todayStart); weekEnd.setDate(weekEnd.getDate() + 7);

    const [todayEvents, weekEvents, overdueTasks, pendingRsvps] = await Promise.all([
      this.getUnifiedView(userId, tenantId, roleLevel, todayStart, todayEnd).then((e) => e.length),
      this.getUnifiedView(userId, tenantId, roleLevel, todayStart, weekEnd).then((e) => e.length),
      this.prisma.working.task.count({
        where: { tenantId, assignedToId: userId, isActive: true, status: 'OPEN', dueDate: { lt: now } },
      }),
      this.prisma.working.eventParticipant.count({
        where: { tenantId, userId, rsvpStatus: 'PENDING', event: { isActive: true, startTime: { gte: now } } },
      }),
    ]);

    return { todayEvents, weekEvents, overdueTasks, pendingRsvps };
  }

  private async getVisibleUserIds(userId: string, roleLevel: number, tenantId: string): Promise<string[]> {
    if (roleLevel <= 1) return []; // empty = all users (admin)
    if (roleLevel <= 3) {
      const reporteeIds = await this.taskAssignment.getReporteeIds(userId);
      return [userId, ...reporteeIds];
    }
    return [userId];
  }

  private applyUserFilter(tenantId: string, userIds: string[], userField: string) {
    // Match both the real tenantId AND empty string (legacy records created without tenantId)
    const where: any = { tenantId: { in: [tenantId, ''] } };
    if (userIds.length > 0) where[userField] = { in: userIds };
    return where;
  }

  private async fetchTasks(tenantId: string, userIds: string[], start: Date, end: Date): Promise<UnifiedCalendarEvent[]> {
    const baseFilter = { ...this.applyUserFilter(tenantId, userIds, 'assignedToId'), isActive: true };
    const where: any = {
      ...baseFilter,
      OR: [
        { dueDate: { gte: start, lte: end } },
        { startDate: { gte: start, lte: end } },
      ],
    };
    const tasks = await this.prisma.working.task.findMany({
      where, select: { id: true, title: true, description: true, dueDate: true, startDate: true, status: true, priority: true, assignedToId: true, assignedTo: { select: { firstName: true, lastName: true } }, entityType: true, entityId: true, createdAt: true },
    });
    return tasks.filter((t) => t.dueDate || t.startDate).map((t) => ({
      id: `task-${t.id}`, source: 'TASK', sourceId: t.id, title: t.title, description: t.description ?? undefined,
      startTime: t.startDate ?? t.dueDate ?? t.createdAt, endTime: t.dueDate ?? undefined, allDay: false,
      color: SOURCE_COLORS.TASK, userId: t.assignedToId ?? '', userName: t.assignedTo ? `${t.assignedTo.firstName} ${t.assignedTo.lastName}` : undefined,
      entityType: t.entityType ?? undefined, entityId: t.entityId ?? undefined, status: t.status, priority: t.priority, editable: false,
    }));
  }

  private async fetchActivities(tenantId: string, userIds: string[], start: Date, end: Date): Promise<UnifiedCalendarEvent[]> {
    const baseFilter = { ...this.applyUserFilter(tenantId, userIds, 'createdById'), isActive: true, isDeleted: false };
    const where: any = {
      ...baseFilter,
      OR: [
        { scheduledAt: { gte: start, lte: end } },
        { endTime: { gte: start, lte: end } },
      ],
    };
    const items = await this.prisma.working.activity.findMany({
