import { IsString, IsNumber, IsInt, IsOptional, Min } from 'class-validator';

export class CreateRechargePlanDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(1)
  amount: number;

  @IsInt()
  @Min(1)
  tokens: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  bonusTokens?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsOptional()
  sortOrder?: number;
}

export class UpdateRechargePlanDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  amount?: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  tokens?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  bonusTokens?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsOptional()
  sortOrder?: number;

  @IsOptional()
  isActive?: boolean;
}
