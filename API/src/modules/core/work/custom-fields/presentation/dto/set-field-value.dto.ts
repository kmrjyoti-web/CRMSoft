import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SetFieldValueDto {
  @ApiProperty({ description: 'Custom field definition ID' })
  @IsString()
  definitionId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  valueText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  valueNumber?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  valueDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  valueBoolean?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  valueJson?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  valueDropdown?: string;
}

export class BulkSetFieldValuesDto {
  @ApiProperty({ type: [SetFieldValueDto] })
  values: SetFieldValueDto[];
}
