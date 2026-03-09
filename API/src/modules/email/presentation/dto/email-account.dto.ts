import { IsNotEmpty, IsOptional, IsString, IsBoolean, IsInt, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EmailProvider } from '@prisma/client';

export class TestConnectionDto {
  @ApiProperty()
  @IsNotEmpty() @IsString()
  smtpHost: string;

  @ApiProperty()
  @IsNotEmpty() @IsInt()
  smtpPort: number;

  @ApiProperty()
  @IsBoolean()
  smtpSecure: boolean;

  @ApiProperty()
  @IsNotEmpty() @IsString()
  smtpUsername: string;

  @ApiProperty()
  @IsNotEmpty() @IsString()
  smtpPassword: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  imapHost?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsInt()
  imapPort?: number;

  @ApiPropertyOptional()
  @IsOptional() @IsBoolean()
  imapSecure?: boolean;
}

export class OAuthInitiateDto {
  @ApiProperty({ enum: ['GMAIL', 'OUTLOOK'] })
  @IsNotEmpty() @IsString()
  provider: 'GMAIL' | 'OUTLOOK';
}

export class OAuthCallbackDto {
  @ApiProperty()
  @IsNotEmpty() @IsString()
  code: string;

  @ApiProperty({ enum: ['GMAIL', 'OUTLOOK'] })
  @IsNotEmpty() @IsString()
  provider: 'GMAIL' | 'OUTLOOK';

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  emailAddress?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  displayName?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  label?: string;
}

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
