export declare class SubmitApprovalCommand {
    readonly entityType: string;
    readonly entityId: string | undefined;
    readonly action: string;
    readonly makerId: string;
    readonly roleName: string;
    readonly roleLevel: number;
    readonly payload?: Record<string, any> | undefined;
    readonly makerNote?: string | undefined;
    constructor(entityType: string, entityId: string | undefined, action: string, makerId: string, roleName: string, roleLevel: number, payload?: Record<string, any> | undefined, makerNote?: string | undefined);
}
