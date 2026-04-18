import { TaskAssignmentService } from './task-assignment.service';
interface VisibilityContext {
    userId: string;
    roleLevel: number;
    tenantId: string;
    departmentId?: string;
}
export declare class TaskVisibilityService {
    private readonly assignmentService;
    constructor(assignmentService: TaskAssignmentService);
    buildWhereClause(ctx: VisibilityContext): Promise<{
        tenantId: string;
        isActive: boolean;
    } | {
        OR: any[];
        tenantId: string;
        isActive: boolean;
    }>;
    getReportingUserIds(managerId: string): Promise<string[]>;
}
export {};
