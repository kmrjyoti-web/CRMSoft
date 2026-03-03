import { IsArray, IsOptional, IsString, IsUUID, IsBoolean, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VALID_ENTITY_TYPES, EntityType } from '../../entity-filter.types';

export class AssignFiltersDto {
  @ApiProperty({ type: [String], description: 'LookupValue IDs to assign' })
  @IsArray() @IsUUID('4', { each: true })
  lookupValueIds: string[];
}

export class ReplaceFiltersDto {
  @ApiProperty({ type: [String], description: 'New LookupValue IDs (replaces existing)' })
  @IsArray() @IsUUID('4', { each: true })
  lookupValueIds: string[];

  @ApiPropertyOptional({ example: 'LEAD_TYPE', description: 'Only replace values from this category' })
  @IsOptional() @IsString()
  category?: string;
}

export class CopyFiltersDto {
  @ApiProperty({ enum: VALID_ENTITY_TYPES }) @IsEnum(VALID_ENTITY_TYPES) targetType: EntityType;
  @ApiProperty() @IsUUID() targetId: string;
}

export class FilterSearchDto {
  @ApiProperty({ type: [String], description: 'LookupValue IDs to search by' })
  @IsArray() @IsUUID('4', { each: true })
  lookupValueIds: string[];

  @ApiPropertyOptional({ default: false, description: 'true=AND (all filters), false=OR (any filter)' })
  @IsOptional() @IsBoolean()
  matchAll?: boolean;
}
