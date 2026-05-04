export class ListCommunicationLogQuery {
  constructor(
    public readonly tenantId: string,
    public readonly entityType: 'CONTACT' | 'ORGANIZATION' | 'LEDGER',
    public readonly entityId: string,
    public readonly channel?: 'EMAIL' | 'WHATSAPP',
    public readonly status?: string,
    public readonly limit: number = 50,
    public readonly offset: number = 0,
  ) {}
}
