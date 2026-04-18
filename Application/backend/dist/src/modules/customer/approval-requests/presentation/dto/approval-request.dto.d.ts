export declare class SubmitApprovalDto {
    entityType: string;
    entityId?: string;
    action: string;
    payload?: Record<string, any>;
    makerNote?: string;
}
export declare class ApproveRejectDto {
    note?: string;
}
