import { IsString, IsOptional, IsArray, IsBoolean, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MasterCodeFiltersDto {
  @ApiPropertyOptional() @IsOptional() @IsString() partnerCode?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() brandCode?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() verticalCode?: string;
}

export class CreateMasterCodeDto {
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(20) partnerCode: string;
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(20) editionCode: string;
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(20) brandCode: string;
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(20) verticalCode: string;
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(120) displayName: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional({ type: [Object] }) @IsOptional() @IsArray() commonRegFields?: object[];
  @ApiPropertyOptional({ type: [Object] }) @IsOptional() @IsArray() commonOnboardingStages?: object[];
}

export class UpdateMasterCodeDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(2) @MaxLength(120) displayName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional({ type: [Object] }) @IsOptional() @IsArray() commonRegFields?: object[];
  @ApiPropertyOptional({ type: [Object] }) @IsOptional() @IsArray() commonOnboardingStages?: object[];
}

export class CreateMasterCodeConfigDto {
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(20) userTypeCode: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(20) subTypeCode?: string;
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(120) displayName: string;
  @ApiPropertyOptional({ type: [Object] }) @IsOptional() @IsArray() extraRegFields?: object[];
  @ApiPropertyOptional({ type: [Object] }) @IsOptional() @IsArray() overrideOnboardingStages?: object[];
}

export class UpdateMasterCodeConfigDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(2) @MaxLength(120) displayName?: string;
  @ApiPropertyOptional({ type: [Object] }) @IsOptional() @IsArray() extraRegFields?: object[];
  @ApiPropertyOptional({ type: [Object] }) @IsOptional() @IsArray() overrideOnboardingStages?: object[];
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
}
