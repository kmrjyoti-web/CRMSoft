import { PrismaService } from '../../../../core/prisma/prisma.service';
import { TaskAssignmentService } from '../../../customer/tasks/application/services/task-assignment.service';
import { UnifiedCalendarEvent } from '../../../../common/interfaces/calendar-event.interface';
export declare class UnifiedCalendarService {
    private readonly prisma;
    private readonly taskAssignment;
    constructor(prisma: PrismaService, taskAssignment: TaskAssignmentService);
    getUnifiedView(userId: string, tenantId: string, roleLevel: number, startDate: Date, endDate: Date, sources?: string[], search?: string): Promise<UnifiedCalendarEvent[]>;
    getTeamView(userId: string, tenantId: string, roleLevel: number, startDate: Date, endDate: Date, teamUserIds?: string[]): Promise<UnifiedCalendarEvent[]>;
    getStats(userId: string, tenantId: string, roleLevel: number): Promise<{
        todayEvents: number;
        weekEvents: number;
        overdueTasks: number;
        pendingRsvps: number;
    }>;
    private getVisibleUserIds;
    private applyUserFilter;
    private fetchTasks;
    private fetchActivities;
    private fetchDemos;
    private fetchTourPlans;
    private fetchReminders;
    private fetchFollowUps;
    private fetchScheduledEvents;
}
