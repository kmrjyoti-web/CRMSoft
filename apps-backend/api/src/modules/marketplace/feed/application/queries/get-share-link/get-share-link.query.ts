export class GetShareLinkQuery {
  constructor(
    public readonly entityType: 'listing' | 'post' | 'offer',
    public readonly entityId: string,
    public readonly tenantId: string,
  ) {}
}
