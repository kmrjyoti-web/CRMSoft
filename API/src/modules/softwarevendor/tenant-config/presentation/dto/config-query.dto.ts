import { IsOptional, IsEnum } from 'class-validator';
import { ConfigCategory } from '@prisma/identity-client';

export class ConfigQueryDto {
  @IsOptional()
  @IsEnum(ConfigCategory)
  category?: ConfigCategory;
}
