import { IsOptional, IsString, IsDateString } from 'class-validator';
import { PaginationDto } from '../../../../../common/dto/pagination.dto';

export class CredentialLogQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  credentialId?: string;

  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
