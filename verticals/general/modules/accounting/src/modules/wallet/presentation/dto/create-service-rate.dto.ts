import { IsString, IsInt, IsOptional, Min } from 'class-validator';

export class CreateServiceRateDto {
  @IsString()
  serviceKey: string;

  @IsString()
  displayName: string;

  @IsString()
  category: string;

  @IsInt()
  @Min(1)
  baseTokens: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  marginPct?: number;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateServiceRateDto {
  @IsString()
  @IsOptional()
  displayName?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  baseTokens?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  marginPct?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  isActive?: boolean;
}
