import { IsString, IsOptional, IsObject, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AssignBusinessTypeDto {
  @ApiProperty() @IsString() typeCode: string;
}

export class UpdateTradeProfileDto {
  @ApiProperty() @IsObject() profile: Record<string, any>;
}

export class TerminologyItemDto {
  @ApiProperty() @IsString() termKey: string;
  @ApiProperty() @IsString() defaultLabel: string;
  @ApiProperty() @IsString() customLabel: string;
  @ApiPropertyOptional() @IsOptional() @IsString() scope?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() regionalLabel?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() userHelpText?: string;
}

export class UpdateBusinessTypeDto {
  @ApiPropertyOptional() @IsOptional() @IsString() typeName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() icon?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() colorTheme?: string;
  @ApiPropertyOptional() @IsOptional() @IsObject() terminologyMap?: Record<string, any>;
  @ApiPropertyOptional() @IsOptional() @IsObject() extraFields?: Record<string, any>;
  @ApiPropertyOptional() @IsOptional() defaultModules?: string[];
  @ApiPropertyOptional() @IsOptional() recommendedModules?: string[];
  @ApiPropertyOptional() @IsOptional() excludedModules?: string[];
  @ApiPropertyOptional() @IsOptional() defaultLeadStages?: Record<string, unknown>;
  @ApiPropertyOptional() @IsOptional() defaultActivityTypes?: Record<string, unknown>;
  @ApiPropertyOptional() @IsOptional() registrationFields?: Record<string, unknown>;
  @ApiPropertyOptional() @IsOptional() dashboardWidgets?: string[];
  @ApiPropertyOptional() @IsOptional() isActive?: boolean;
  @ApiPropertyOptional() @IsOptional() sortOrder?: number;
}

export class BulkTerminologyDto {
  @ApiProperty({ type: [TerminologyItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TerminologyItemDto)
  items: TerminologyItemDto[];
}
