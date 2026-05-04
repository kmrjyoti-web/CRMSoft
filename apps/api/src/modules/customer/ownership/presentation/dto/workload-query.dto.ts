import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../../../common/dto/pagination.dto';

export class WorkloadQueryDto {
  @IsOptional() @IsString() roleId?: string;
}

export class OwnershipQueryDto extends PaginationDto {
  @IsOptional() @IsString() entityType?: string;
  @IsOptional() @IsString() ownerType?: string;
  @IsOptional() @IsString() status?: string;
}
