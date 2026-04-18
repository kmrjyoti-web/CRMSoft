import { PaginationDto } from '../../../../../common/dto/pagination.dto';
export declare class CredentialLogQueryDto extends PaginationDto {
    credentialId?: string;
    action?: string;
    dateFrom?: string;
    dateTo?: string;
}
