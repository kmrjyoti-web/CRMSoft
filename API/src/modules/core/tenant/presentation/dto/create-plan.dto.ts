import {
  IsString, IsOptional, IsEnum, IsNumber, IsBoolean, IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PlanInterval, FeatureFlag } from '@prisma/client';

export class CreatePlanDto {
  @ApiProperty({ description: 'Plan name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Unique plan code' })
  @IsString()
  code: string;

  @ApiPropertyOptional({ description: 'Plan description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: PlanInterval, description: 'Billing interval' })
  @IsEnum(PlanInterval)
  interval: PlanInterval;

  @ApiProperty({ description: 'Plan price' })
  @IsNumber()
  price: number;

  @ApiPropertyOptional({ description: 'Currency code', default: 'INR' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ description: 'Maximum number of users' })
  @IsNumber()
  maxUsers: number;

  @ApiProperty({ description: 'Maximum number of contacts' })
  @IsNumber()
  maxContacts: number;

  @ApiProperty({ description: 'Maximum number of leads' })
  @IsNumber()
  maxLeads: number;

  @ApiProperty({ description: 'Maximum number of products' })
  @IsNumber()
  maxProducts: number;

  @ApiProperty({ description: 'Maximum storage in MB' })
  @IsNumber()
  maxStorage: number;

  @ApiPropertyOptional({ enum: FeatureFlag, isArray: true, description: 'Enabled feature flags' })
  @IsOptional()
  @IsArray()
  @IsEnum(FeatureFlag, { each: true })
  features?: FeatureFlag[];

  @ApiPropertyOptional({ description: 'Whether the plan is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Sort order for display' })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}
