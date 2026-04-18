import { PaginationDto } from '../../../../../common/dto/pagination.dto';
export declare class ReminderQueryDto extends PaginationDto {
    recipientId?: string;
    channel?: string;
    isSent?: boolean;
}
