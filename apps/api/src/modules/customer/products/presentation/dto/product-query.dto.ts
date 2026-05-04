import { IsOptional, IsString, IsEnum, IsUUID, IsBoolean, IsNumber, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { TaxTypeEnum } from './create-product.dto';

export class ProductQueryDto {
  @ApiPropertyOptional({ description: 'Search by name, code, or short description' })
  @IsOptional() @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ['ACTIVE', 'INACTIVE', 'DISCONTINUED', 'COMING_SOON'] })
  @IsOptional() @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Filter by parent product ID' })
  @IsOptional() @IsUUID()
  parentId?: string;

  @ApiPropertyOptional({ description: 'Filter master products only' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isMaster?: boolean;

  @ApiPropertyOptional() @IsOptional() @IsUUID()
  brandId?: string;

  @ApiPropertyOptional() @IsOptional() @IsUUID()
  manufacturerId?: string;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional() @IsNumber() @Type(() => Number)
  minPrice?: number;

  @ApiPropertyOptional({ example: 5000 })
  @IsOptional() @IsNumber() @Type(() => Number)
  maxPrice?: number;

  @ApiPropertyOptional({ enum: TaxTypeEnum })
  @IsOptional() @IsEnum(TaxTypeEnum)
  taxType?: TaxTypeEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  licenseRequired?: boolean;

  @ApiPropertyOptional({ description: 'Comma-separated tags', example: 'electronics,wireless' })
  @IsOptional() @IsString()
  tags?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional() @IsInt() @Min(1) @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional() @IsInt() @Min(1) @Type(() => Number)
  limit?: number;

  @ApiPropertyOptional({ default: 'createdAt', enum: ['name', 'code', 'salePrice', 'createdAt', 'sortOrder'] })
  @IsOptional() @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ default: 'desc', enum: ['asc', 'desc'] })
  @IsOptional() @IsEnum(['asc', 'desc'])
  sortDir?: 'asc' | 'desc';
}
