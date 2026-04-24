import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../../../../common/dto/pagination.dto';

export class OrganizationQueryDto extends PaginationDto {
  @ApiPropertyOptional({ example: 'Mumbai' })
  @IsOptional() @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'IT / Software' })
  @IsOptional() @IsString()
  industry?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isActive?: boolean;
}
