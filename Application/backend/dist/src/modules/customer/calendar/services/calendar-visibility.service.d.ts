import { TaskAssignmentService } from '../../../customer/tasks/application/services/task-assignment.service';
export interface CalendarVisibilityContext {
    userId: string;
    roleLevel: number;
    tenantId: string;
    departmentId?: string;
}
export declare class CalendarVisibilityService {
    private readonly taskAssignment;
    constructor(taskAssignment: TaskAssignmentService);
    buildWhereClause(ctx: CalendarVisibilityContext): Promise<Record<string, unknown>>;
    buildCalendarEventWhere(ctx: CalendarVisibilityContext): Promise<Record<string, unknown>>;
}
