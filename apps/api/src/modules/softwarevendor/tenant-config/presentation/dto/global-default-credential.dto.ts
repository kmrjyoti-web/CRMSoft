import { IsEnum, IsOptional, IsString, IsBoolean, IsObject, IsNotEmpty } from 'class-validator';
import { CredentialProvider } from '@prisma/identity-client';

export class GlobalDefaultCredentialDto {
  @IsEnum(CredentialProvider)
  provider: CredentialProvider;

  @IsObject()
  @IsNotEmpty()
  credentials: Record<string, any>;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}
