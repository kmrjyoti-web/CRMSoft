export declare class UpdateDemoCommand {
    readonly id: string;
    readonly userId: string;
    readonly data: {
        mode?: string;
        scheduledAt?: Date;
        duration?: number;
        meetingLink?: string;
        location?: string;
        notes?: string;
    };
    constructor(id: string, userId: string, data: {
        mode?: string;
        scheduledAt?: Date;
        duration?: number;
        meetingLink?: string;
        location?: string;
        notes?: string;
    });
}
