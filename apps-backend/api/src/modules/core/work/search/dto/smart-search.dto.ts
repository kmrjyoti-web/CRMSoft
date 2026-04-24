import { IsString, IsArray, IsOptional, IsIn, IsNumber, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchFilterDto {
  @IsString()
  parameter: string;

  @IsString()
  value: string;

  @IsIn(['CONTAINS', 'STARTS_WITH', 'ENDS_WITH', 'EXACT'])
  pattern: 'CONTAINS' | 'STARTS_WITH' | 'ENDS_WITH' | 'EXACT';
}

export class SmartSearchDto {
  @IsIn(['CONTACT', 'ORGANIZATION', 'PRODUCT', 'LEDGER', 'ROW_CONTACT', 'INVOICE'])
  entityType: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SearchFilterDto)
  filters: SearchFilterDto[];

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}
