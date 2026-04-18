import { PaginationDto } from '../../../../../common/dto/pagination.dto';
export declare class SyncQueryDto extends PaginationDto {
    entityName?: string;
    userId?: string;
    deviceId?: string;
    action?: string;
    dateFrom?: string;
    dateTo?: string;
}
