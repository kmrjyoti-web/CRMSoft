import { IsOptional, IsString, IsBoolean, IsInt, IsObject } from 'class-validator';

export class UpdateCredentialDto {
  @IsOptional()
  @IsObject()
  credentials?: Record<string, any>;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @IsInt()
  dailyUsageLimit?: number;
}
