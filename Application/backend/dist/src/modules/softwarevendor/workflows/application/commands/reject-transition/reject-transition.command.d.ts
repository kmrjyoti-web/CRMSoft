export declare class RejectTransitionCommand {
    readonly approvalId: string;
    readonly userId: string;
    readonly comment?: string | undefined;
    constructor(approvalId: string, userId: string, comment?: string | undefined);
}
