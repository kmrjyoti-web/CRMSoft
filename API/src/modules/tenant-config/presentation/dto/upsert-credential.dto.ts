import { IsEnum, IsOptional, IsString, IsBoolean, IsInt, IsObject, IsNotEmpty, IsEmail } from 'class-validator';
import { CredentialProvider } from '@prisma/client';

export class UpsertCredentialDto {
  @IsEnum(CredentialProvider)
  provider: CredentialProvider;

  @IsOptional()
  @IsString()
  instanceName?: string;

  @IsObject()
  @IsNotEmpty()
  credentials: Record<string, any>;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @IsInt()
  dailyUsageLimit?: number;

  @IsOptional()
  @IsEmail()
  linkedAccountEmail?: string;

  @IsOptional()
  @IsString()
  webhookUrl?: string;
}
