export declare class CompleteTaskCommand {
    readonly taskId: string;
    readonly userId: string;
    readonly completionNotes?: string | undefined;
    readonly actualMinutes?: number | undefined;
    constructor(taskId: string, userId: string, completionNotes?: string | undefined, actualMinutes?: number | undefined);
}
