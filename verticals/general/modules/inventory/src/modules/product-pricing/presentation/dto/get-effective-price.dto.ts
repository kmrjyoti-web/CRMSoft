import {
  IsUUID, IsOptional, IsNumber, IsBoolean, IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class GetEffectivePriceDto {
  @ApiProperty({ description: 'Product UUID' })
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @ApiPropertyOptional({ description: 'Contact UUID for group lookup' })
  @IsOptional()
  @IsUUID()
  contactId?: string;

  @ApiPropertyOptional({ description: 'Organization UUID for group lookup' })
  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  quantity?: number = 1;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isInterState?: boolean = false;
}
