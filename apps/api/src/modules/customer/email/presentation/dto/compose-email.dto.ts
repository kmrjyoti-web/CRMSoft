import { IsNotEmpty, IsOptional, IsString, IsBoolean, IsArray, IsEnum, IsDateString, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { EmailPriority } from '@prisma/working-client';

export class EmailRecipientDto {
  @ApiProperty()
  @IsNotEmpty() @IsString()
  email: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  name?: string;
}

export class ComposeEmailDto {
  @ApiProperty()
  @IsNotEmpty() @IsString()
  accountId: string;

  @ApiProperty({ type: [EmailRecipientDto] })
  @IsArray() @ValidateNested({ each: true }) @Type(() => EmailRecipientDto)
  to: EmailRecipientDto[];

  @ApiPropertyOptional({ type: [EmailRecipientDto] })
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => EmailRecipientDto)
  cc?: EmailRecipientDto[];

  @ApiPropertyOptional({ type: [EmailRecipientDto] })
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => EmailRecipientDto)
  bcc?: EmailRecipientDto[];

  @ApiProperty()
  @IsNotEmpty() @IsString()
  subject: string;

  @ApiProperty()
  @IsNotEmpty() @IsString()
  bodyHtml: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  bodyText?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  templateId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  templateData?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  signatureId?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  replyToEmailId?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsDateString()
  scheduledAt?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsBoolean()
  sendNow?: boolean;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  entityType?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  entityId?: string;

  @ApiPropertyOptional({ enum: EmailPriority })
  @IsOptional() @IsEnum(EmailPriority)
  priority?: EmailPriority;

  @ApiPropertyOptional()
  @IsOptional() @IsBoolean()
  trackOpens?: boolean;

  @ApiPropertyOptional()
  @IsOptional() @IsBoolean()
  trackClicks?: boolean;
}

export class ReplyEmailDto {
  @ApiProperty()
  @IsNotEmpty() @IsString()
  originalEmailId: string;

  @ApiProperty({ enum: ['REPLY', 'REPLY_ALL', 'FORWARD'] })
  @IsNotEmpty() @IsString()
  replyType: 'REPLY' | 'REPLY_ALL' | 'FORWARD';

  @ApiPropertyOptional({ type: [EmailRecipientDto] })
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => EmailRecipientDto)
  to?: EmailRecipientDto[];

  @ApiProperty()
  @IsNotEmpty() @IsString()
  bodyHtml: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  bodyText?: string;
}
