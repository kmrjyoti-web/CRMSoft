export declare class UpdateTaskCommand {
    readonly taskId: string;
    readonly userId: string;
    readonly title?: string | undefined;
    readonly description?: string | undefined;
    readonly priority?: string | undefined;
    readonly dueDate?: Date | undefined;
    readonly recurrence?: string | undefined;
    constructor(taskId: string, userId: string, title?: string | undefined, description?: string | undefined, priority?: string | undefined, dueDate?: Date | undefined, recurrence?: string | undefined);
}
