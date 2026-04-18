import { EmailPriority } from '@prisma/working-client';
export declare class EmailRecipientDto {
    email: string;
    name?: string;
}
export declare class ComposeEmailDto {
    accountId: string;
    to: EmailRecipientDto[];
    cc?: EmailRecipientDto[];
    bcc?: EmailRecipientDto[];
    subject: string;
    bodyHtml: string;
    bodyText?: string;
    templateId?: string;
    templateData?: Record<string, any>;
    signatureId?: string;
    replyToEmailId?: string;
    scheduledAt?: string;
    sendNow?: boolean;
    entityType?: string;
    entityId?: string;
    priority?: EmailPriority;
    trackOpens?: boolean;
    trackClicks?: boolean;
}
export declare class ReplyEmailDto {
    originalEmailId: string;
    replyType: 'REPLY' | 'REPLY_ALL' | 'FORWARD';
    to?: EmailRecipientDto[];
    bodyHtml: string;
    bodyText?: string;
}
