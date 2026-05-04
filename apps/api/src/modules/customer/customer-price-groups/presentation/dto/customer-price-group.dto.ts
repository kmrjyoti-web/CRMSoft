import {
  IsString, IsOptional, IsNumber, IsInt, IsBoolean,
  IsUUID, MinLength, ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePriceGroupDto {
  @ApiProperty({ example: 'Wholesale Tier 1' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'WT1' })
  @IsString()
  @MinLength(1)
  code: string;

  @ApiPropertyOptional({ example: 'Wholesale customers with high volume' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 15.5 })
  @IsOptional()
  @IsNumber()
  discount?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  priority?: number;
}

export class UpdatePriceGroupDto {
  @ApiPropertyOptional({ example: 'Wholesale Tier 1' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional({ example: 'WT1' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 15.5 })
  @IsOptional()
  @IsNumber()
  discount?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  priority?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class AddMemberDto {
  @ApiPropertyOptional({ description: 'Contact UUID — at least one of contactId or organizationId required' })
  @ValidateIf((o) => !o.organizationId)
  @IsUUID()
  contactId?: string;

  @ApiPropertyOptional({ description: 'Organization UUID — at least one of contactId or organizationId required' })
  @ValidateIf((o) => !o.contactId)
  @IsUUID()
  organizationId?: string;
}
