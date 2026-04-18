import { CredentialProvider, CredentialStatus } from '@prisma/identity-client';
import { PaginationDto } from '../../../../../common/dto/pagination.dto';
export declare class CredentialQueryDto extends PaginationDto {
    provider?: CredentialProvider;
    status?: CredentialStatus;
}
