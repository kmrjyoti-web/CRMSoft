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

export class BulkTerminologyDto {
  @ApiProperty({ type: [TerminologyItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TerminologyItemDto)
  items: TerminologyItemDto[];
}
