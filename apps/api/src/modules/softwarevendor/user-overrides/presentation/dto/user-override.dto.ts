import { IsString, IsOptional, IsDateString } from 'class-validator';

export class GrantPermissionDto {
  @IsString()
  action: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class DenyPermissionDto {
  @IsString()
  action: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
