export class LinkToEntityCommand {
  constructor(
    public readonly communicationId: string,
    public readonly entityType: 'contact' | 'organization' | 'lead',
    public readonly entityId: string,
  ) {}
}
