import { PaginationDto } from '../../../../../../common/dto/pagination.dto';
export declare class NotificationQueryDto extends PaginationDto {
    category?: string;
    status?: string;
    priority?: string;
}
