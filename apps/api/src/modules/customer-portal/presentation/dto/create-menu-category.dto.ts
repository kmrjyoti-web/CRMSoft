import { IsArray, IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMenuCategoryDto {
  @ApiProperty({ example: 'Premium Customer' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiPropertyOptional({ example: 'प्रीमियम ग्राहक' })
  @IsOptional()
  @IsString()
  nameHi?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'crown' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ example: 'purple' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({
    type: [String],
    example: ['/dashboard', '/invoices', '/payments'],
  })
  @IsArray()
  @IsString({ each: true })
  enabledRoutes: string[];

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  sortOrder?: number;
}
