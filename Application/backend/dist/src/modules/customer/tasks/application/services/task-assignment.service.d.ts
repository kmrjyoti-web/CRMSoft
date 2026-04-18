import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { TaskLogicService } from '../../../../customer/task-logic/task-logic.service';
export declare class TaskAssignmentService {
    private readonly prisma;
    private readonly taskLogic;
    private readonly logger;
    constructor(prisma: PrismaService, taskLogic: TaskLogicService);
    validateAssignment(creatorId: string, assigneeId: string, creatorRoleLevel: number, assignmentScope?: string, assignedDepartmentId?: string, assignedDesignationId?: string, assignedRoleId?: string): Promise<void>;
    private validateReporteeChain;
    private validateDepartmentScope;
    private validateDesignationScope;
    private getDefaultScope;
    getReporteeIds(managerId: string): Promise<string[]>;
}
