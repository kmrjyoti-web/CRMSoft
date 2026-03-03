import { IsNotEmpty, IsOptional, IsString, IsBoolean, IsInt, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EmailProvider } from '@prisma/client';

export class ConnectAccountDto {
  @ApiProperty({ enum: EmailProvider })
  @IsNotEmpty() @IsEnum(EmailProvider)
  provider: EmailProvider;

  @ApiProperty()
  @IsNotEmpty() @IsString()
  emailAddress: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  displayName?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  label?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  accessToken?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  refreshToken?: string;

  // IMAP/SMTP
  @ApiPropertyOptional()
  @IsOptional() @IsString()
  imapHost?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsInt()
  imapPort?: number;

  @ApiPropertyOptional()
  @IsOptional() @IsBoolean()
  imapSecure?: boolean;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  smtpHost?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsInt()
  smtpPort?: number;

  @ApiPropertyOptional()
  @IsOptional() @IsBoolean()
  smtpSecure?: boolean;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  smtpUsername?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  smtpPassword?: string;
}
