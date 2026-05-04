import { IsString, IsOptional, IsBoolean, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMaskingPolicyDto {
  @ApiProperty({ example: 'contacts' })
  @IsString()
  tableKey: string;

  @ApiProperty({ example: 'email' })
  @IsString()
  columnId: string;

  @ApiPropertyOptional({ description: 'Role to apply policy to (null = all roles)' })
  @IsOptional()
  @IsString()
  roleId?: string;

  @ApiPropertyOptional({ description: 'User to apply policy to (null = all users in role)' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ example: 'PARTIAL', enum: ['FULL', 'PARTIAL', 'NONE'] })
  @IsString()
  @IsIn(['FULL', 'PARTIAL', 'NONE'])
  maskType: string;

  @ApiPropertyOptional({ example: true, description: 'Allow user to unmask per-row' })
  @IsOptional()
  @IsBoolean()
  canUnmask?: boolean;
}

export class UpdateMaskingPolicyDto {
  @ApiPropertyOptional({ enum: ['FULL', 'PARTIAL', 'NONE'] })
  @IsOptional()
  @IsString()
  @IsIn(['FULL', 'PARTIAL', 'NONE'])
  maskType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  canUnmask?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
