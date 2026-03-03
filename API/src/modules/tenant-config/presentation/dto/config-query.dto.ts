import { IsOptional, IsEnum } from 'class-validator';
import { ConfigCategory } from '@prisma/client';

export class ConfigQueryDto {
  @IsOptional()
  @IsEnum(ConfigCategory)
  category?: ConfigCategory;
}
