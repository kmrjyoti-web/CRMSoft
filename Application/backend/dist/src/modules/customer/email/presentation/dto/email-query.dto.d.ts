import { EmailDirection, EmailStatus } from '@prisma/working-client';
import { PaginationDto } from '../../../../../common/dto/pagination.dto';
export declare class EmailQueryDto extends PaginationDto {
    accountId?: string;
    direction?: EmailDirection;
    status?: EmailStatus;
    isStarred?: boolean;
    isRead?: boolean;
}
export declare class SearchEmailsDto extends PaginationDto {
    query?: string;
    accountId?: string;
}
