import { PaginationDto } from '../../../../../common/dto/pagination.dto';
export declare class DemoQueryDto extends PaginationDto {
    status?: string;
    mode?: string;
    conductedById?: string;
    fromDate?: string;
    toDate?: string;
}
