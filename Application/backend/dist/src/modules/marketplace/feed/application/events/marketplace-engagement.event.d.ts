export declare class MarketplaceEngagementEvent {
    readonly type: string;
    readonly actorId: string;
    readonly targetUserId: string;
    readonly entityId: string;
    readonly entityType: 'POST' | 'LISTING' | 'OFFER' | 'REVIEW' | 'ENQUIRY';
    readonly tenantId: string;
    constructor(type: string, actorId: string, targetUserId: string, entityId: string, entityType: 'POST' | 'LISTING' | 'OFFER' | 'REVIEW' | 'ENQUIRY', tenantId: string);
}
