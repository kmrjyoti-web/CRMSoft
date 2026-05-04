export class TrackEventCommand {
  constructor(
    public readonly tenantId: string,
    public readonly entityType: string,
    public readonly entityId: string,
    public readonly eventType: string,
    public readonly userId?: string,
    public readonly source?: string,
    public readonly deviceType?: string,
    public readonly city?: string,
    public readonly state?: string,
    public readonly pincode?: string,
    public readonly orderValue?: number,
    public readonly metadata?: Record<string, any>,
  ) {}
}
