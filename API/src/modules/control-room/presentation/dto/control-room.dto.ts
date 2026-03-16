import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRuleDto {
  @ApiProperty({ description: 'New value for the rule (string, number, boolean, JSON)' })
  @IsNotEmpty()
  value: any;

  @ApiProperty({ description: 'Level at which to set the value', example: 'CONTROL_ROOM' })
  @IsString()
  @IsNotEmpty()
  level: string;

  @ApiPropertyOptional({ description: 'Page code for PAGE-level override' })
  @IsString()
  @IsOptional()
  pageCode?: string;

  @ApiPropertyOptional({ description: 'Role ID for RBAC-level override' })
  @IsString()
  @IsOptional()
  roleId?: string;

  @ApiPropertyOptional({ description: 'User ID for RBAC-level override (takes precedence over roleId)' })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({ description: 'Reason for the change (displayed in audit trail)' })
  @IsString()
  @IsOptional()
  changeReason?: string;
}

export class ResetRuleDto {
  @ApiProperty({ description: 'Level to reset', example: 'CONTROL_ROOM' })
  @IsString()
  @IsNotEmpty()
  level: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  pageCode?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  roleId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  changeReason?: string;
}

export class RuleQueryDto {
  @ApiPropertyOptional({ description: 'Filter by category', example: 'SALE' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ description: 'Search term for ruleCode or label' })
  @IsString()
  @IsOptional()
  search?: string;
}

export class AuditQueryDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  level?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  changedByUserId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ default: '1' })
  @IsString()
  @IsOptional()
  page?: string;

  @ApiPropertyOptional({ default: '50' })
  @IsString()
  @IsOptional()
  limit?: string;
}
