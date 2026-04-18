export declare class RescheduleDemoCommand {
    readonly id: string;
    readonly userId: string;
    readonly scheduledAt: Date;
    readonly reason?: string | undefined;
    constructor(id: string, userId: string, scheduledAt: Date, reason?: string | undefined);
}
