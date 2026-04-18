import { PaginationDto } from '../../../../../common/dto/pagination.dto';
export declare class CreateBroadcastDto {
    wabaId: string;
    name: string;
    templateId: string;
    scheduledAt?: string;
    throttlePerSecond?: number;
}
export declare class BroadcastRecipientDto {
    phoneNumber: string;
    contactName?: string;
    variables?: Record<string, unknown>;
}
export declare class AddBroadcastRecipientsDto {
    recipients: BroadcastRecipientDto[];
}
export declare class BroadcastQueryDto extends PaginationDto {
    wabaId: string;
    status?: string;
}
export declare class BroadcastRecipientQueryDto extends PaginationDto {
    status?: string;
}
