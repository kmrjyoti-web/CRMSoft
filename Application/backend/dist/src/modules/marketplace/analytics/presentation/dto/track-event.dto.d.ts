export declare enum AnalyticsEntityTypeEnum {
    POST = "POST",
    LISTING = "LISTING",
    OFFER = "OFFER"
}
export declare enum AnalyticsEventTypeEnum {
    IMPRESSION = "IMPRESSION",
    CLICK = "CLICK",
    ENQUIRY = "ENQUIRY",
    LEAD = "LEAD",
    CUSTOMER = "CUSTOMER",
    ORDER = "ORDER",
    SHARE = "SHARE",
    SAVE = "SAVE"
}
export declare enum AnalyticsSourceEnum {
    FEED = "FEED",
    SEARCH = "SEARCH",
    SHARE_LINK = "SHARE_LINK",
    DIRECT = "DIRECT",
    NOTIFICATION = "NOTIFICATION",
    QR_CODE = "QR_CODE",
    EXTERNAL = "EXTERNAL"
}
export declare class TrackEventDto {
    entityType: AnalyticsEntityTypeEnum;
    entityId: string;
    eventType: AnalyticsEventTypeEnum;
    source?: AnalyticsSourceEnum;
    deviceType?: string;
    city?: string;
    state?: string;
    pincode?: string;
    orderValue?: number;
    metadata?: Record<string, any>;
}
