export declare class ChangeTaskStatusCommand {
    readonly taskId: string;
    readonly newStatus: string;
    readonly userId: string;
    readonly reason?: string | undefined;
    constructor(taskId: string, newStatus: string, userId: string, reason?: string | undefined);
}
