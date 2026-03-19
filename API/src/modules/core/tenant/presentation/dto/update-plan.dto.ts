import {
  IsString, IsOptional, IsNumber, IsBoolean, IsArray, IsEnum,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { FeatureFlag } from '@prisma/client';

export class UpdatePlanDto {
  @ApiPropertyOptional({ description: 'Plan name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Plan description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Plan price' })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional({ description: 'Maximum number of users' })
  @IsOptional()
  @IsNumber()
  maxUsers?: number;

  @ApiPropertyOptional({ description: 'Maximum number of contacts' })
  @IsOptional()
  @IsNumber()
  maxContacts?: number;

  @ApiPropertyOptional({ description: 'Maximum number of leads' })
  @IsOptional()
  @IsNumber()
  maxLeads?: number;

  @ApiPropertyOptional({ description: 'Maximum number of products' })
  @IsOptional()
  @IsNumber()
  maxProducts?: number;

  @ApiPropertyOptional({ description: 'Maximum storage in MB' })
  @IsOptional()
  @IsNumber()
  maxStorage?: number;

  @ApiPropertyOptional({ enum: FeatureFlag, isArray: true, description: 'Enabled feature flags' })
  @IsOptional()
  @IsArray()
  @IsEnum(FeatureFlag, { each: true })
  features?: FeatureFlag[];

  @ApiPropertyOptional({ description: 'Whether the plan is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Sort order for display' })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}
