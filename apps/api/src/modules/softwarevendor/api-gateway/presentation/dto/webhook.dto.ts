import { IsString, IsOptional, IsArray, IsNumber, Min, Max, ArrayMinSize, IsUrl } from 'class-validator';

export class CreateWebhookDto {
  @IsUrl()
  url: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  events: string[];

  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(60)
  timeoutSeconds?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  maxRetries?: number;

  @IsOptional()
  customHeaders?: Record<string, string>;
}

export class UpdateWebhookDto {
  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  events?: string[];

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(60)
  timeoutSeconds?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  maxRetries?: number;

  @IsOptional()
  customHeaders?: Record<string, string>;
}

export class WebhookQueryDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  event?: string;
}
