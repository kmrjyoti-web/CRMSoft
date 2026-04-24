export class ProcessTrackingEventCommand {
  constructor(
    public readonly eventType: 'OPEN' | 'CLICK' | 'BOUNCE',
    public readonly emailId?: string,
    public readonly trackingPixelId?: string,
    public readonly clickedUrl?: string,
    public readonly ipAddress?: string,
    public readonly userAgent?: string,
    public readonly bounceReason?: string,
  ) {}
}
