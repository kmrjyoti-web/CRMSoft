export declare class UpdateFollowUpCommand {
    readonly id: string;
    readonly userId: string;
    readonly data: {
        title?: string;
        description?: string;
        dueDate?: Date;
        priority?: string;
    };
    constructor(id: string, userId: string, data: {
        title?: string;
        description?: string;
        dueDate?: Date;
        priority?: string;
    });
}
