export declare class UpdateNotifPrefDto {
    inAppEnabled?: boolean;
    emailEnabled?: boolean;
    smsEnabled?: boolean;
    whatsappEnabled?: boolean;
    pushEnabled?: boolean;
    notifyOwner?: boolean;
    notifyCreator?: boolean;
    notifyManager?: boolean;
    notifyAdmin?: boolean;
    customRecipientIds?: string[];
    customRecipientEmails?: string[];
    isRealtime?: boolean;
    delayMinutes?: number;
    digestMode?: boolean;
    emailTemplateId?: string;
    emailSubject?: string;
    customMessage?: string;
    isEnabled?: boolean;
}
export declare class BulkUpdateNotifPrefDto {
    updates: BulkNotifItem[];
}
declare class BulkNotifItem {
    eventCode: string;
    inAppEnabled?: boolean;
    emailEnabled?: boolean;
    smsEnabled?: boolean;
    whatsappEnabled?: boolean;
    pushEnabled?: boolean;
    isEnabled?: boolean;
}
export {};
