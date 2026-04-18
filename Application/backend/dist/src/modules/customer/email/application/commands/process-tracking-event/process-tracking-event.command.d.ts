export declare class ProcessTrackingEventCommand {
    readonly eventType: 'OPEN' | 'CLICK' | 'BOUNCE';
    readonly emailId?: string | undefined;
    readonly trackingPixelId?: string | undefined;
    readonly clickedUrl?: string | undefined;
    readonly ipAddress?: string | undefined;
    readonly userAgent?: string | undefined;
    readonly bounceReason?: string | undefined;
    constructor(eventType: 'OPEN' | 'CLICK' | 'BOUNCE', emailId?: string | undefined, trackingPixelId?: string | undefined, clickedUrl?: string | undefined, ipAddress?: string | undefined, userAgent?: string | undefined, bounceReason?: string | undefined);
}
