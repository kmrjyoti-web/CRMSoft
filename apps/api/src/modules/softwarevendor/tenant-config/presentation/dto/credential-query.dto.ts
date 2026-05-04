import { IsOptional, IsEnum } from 'class-validator';
import { CredentialProvider, CredentialStatus } from '@prisma/identity-client';
import { PaginationDto } from '../../../../../common/dto/pagination.dto';

export class CredentialQueryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(CredentialProvider)
  provider?: CredentialProvider;

  @IsOptional()
  @IsEnum(CredentialStatus)
  status?: CredentialStatus;
}
