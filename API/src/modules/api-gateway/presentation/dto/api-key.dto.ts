import { IsString, IsOptional, IsArray, IsDateString, IsNumber, Min, ArrayMinSize } from 'class-validator';

export class CreateApiKeyDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  scopes: string[];

  @IsOptional()
  @IsString()
  environment?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedIps?: string[];

  @IsOptional()
  @IsNumber()
  @Min(1)
  rateLimitPerMinute?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  rateLimitPerHour?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  rateLimitPerDay?: number;
}

export class UpdateApiKeyScopesDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  scopes: string[];
}

export class RevokeApiKeyDto {
  @IsString()
  reason: string;
}

export class ApiKeyQueryDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  environment?: string;
}
