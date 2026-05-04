export class GetCommunicationsByEntityQuery {
  constructor(
    public readonly entityType: 'rawContact' | 'contact' | 'organization' | 'lead',
    public readonly entityId: string,
    public readonly type?: string,
  ) {}
}
