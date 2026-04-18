export declare class RejectTaskCommand {
    readonly id: string;
    readonly userId: string;
    readonly reason?: string | undefined;
    constructor(id: string, userId: string, reason?: string | undefined);
}
