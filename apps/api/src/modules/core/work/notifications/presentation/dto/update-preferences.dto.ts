import { IsOptional, IsObject, IsString } from 'class-validator';

export class UpdatePreferencesDto {
  @IsOptional() @IsObject()
  channels?: Record<string, unknown>;

  @IsOptional() @IsObject()
  categories?: Record<string, unknown>;

  @IsOptional() @IsString()
  quietHoursStart?: string;

  @IsOptional() @IsString()
  quietHoursEnd?: string;

  @IsOptional() @IsString()
  digestFrequency?: string;

  @IsOptional() @IsString()
  timezone?: string;
}
