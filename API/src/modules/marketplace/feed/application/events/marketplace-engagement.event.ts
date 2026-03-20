export class MarketplaceEngagementEvent {
  constructor(
    public readonly type: string,
    public readonly actorId: string,
    public readonly targetUserId: string,
    public readonly entityId: string,
    public readonly entityType: 'POST' | 'LISTING' | 'OFFER' | 'REVIEW' | 'ENQUIRY',
    public readonly tenantId: string,
  ) {}
}
