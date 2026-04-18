import { PaginationDto } from '../../../../../common/dto/pagination.dto';
export declare class WorkloadQueryDto {
    roleId?: string;
}
export declare class OwnershipQueryDto extends PaginationDto {
    entityType?: string;
    ownerType?: string;
    status?: string;
}
