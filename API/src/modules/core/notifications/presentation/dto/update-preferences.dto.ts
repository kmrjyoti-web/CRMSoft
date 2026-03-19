import { IsOptional, IsObject, IsString } from 'class-validator';

export class UpdatePreferencesDto {
  @IsOptional() @IsObject()
  channels?: any;

  @IsOptional() @IsObject()
  categories?: any;

  @IsOptional() @IsString()
  quietHoursStart?: string;

  @IsOptional() @IsString()
  quietHoursEnd?: string;

  @IsOptional() @IsString()
  digestFrequency?: string;

  @IsOptional() @IsString()
  timezone?: string;
}
