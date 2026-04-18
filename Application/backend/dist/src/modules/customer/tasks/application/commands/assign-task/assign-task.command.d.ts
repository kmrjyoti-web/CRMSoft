export declare class AssignTaskCommand {
    readonly taskId: string;
    readonly newAssigneeId: string;
    readonly userId: string;
    readonly userRoleLevel: number;
    constructor(taskId: string, newAssigneeId: string, userId: string, userRoleLevel: number);
}
