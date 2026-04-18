import { CampaignStatus } from '@prisma/working-client';
import { PaginationDto } from '../../../../../common/dto/pagination.dto';
export declare class CreateCampaignDto {
    name: string;
    description?: string;
    subject: string;
    bodyHtml: string;
    bodyText?: string;
    accountId: string;
    fromName?: string;
    replyToEmail?: string;
    templateId?: string;
    sendRatePerMinute?: number;
    batchSize?: number;
    trackOpens?: boolean;
    trackClicks?: boolean;
    includeUnsubscribe?: boolean;
    scheduledAt?: string;
}
export declare class UpdateCampaignDto {
    name?: string;
    description?: string;
    subject?: string;
    bodyHtml?: string;
    bodyText?: string;
    sendRatePerMinute?: number;
    scheduledAt?: string;
}
export declare class CampaignRecipientDto {
    email: string;
    firstName?: string;
    lastName?: string;
    companyName?: string;
    contactId?: string;
    mergeData?: Record<string, any>;
}
export declare class AddCampaignRecipientsDto {
    recipients: CampaignRecipientDto[];
}
export declare class CampaignQueryDto extends PaginationDto {
    status?: CampaignStatus;
}
export declare class CampaignRecipientQueryDto extends PaginationDto {
    status?: string;
}
