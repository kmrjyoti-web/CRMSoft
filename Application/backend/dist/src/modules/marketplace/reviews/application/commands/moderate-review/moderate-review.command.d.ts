export type ModerationAction = 'APPROVE' | 'REJECT' | 'FLAG';
export declare class ModerateReviewCommand {
    readonly reviewId: string;
    readonly tenantId: string;
    readonly moderatorId: string;
    readonly action: ModerationAction;
    readonly note?: string | undefined;
    constructor(reviewId: string, tenantId: string, moderatorId: string, action: ModerationAction, note?: string | undefined);
}
