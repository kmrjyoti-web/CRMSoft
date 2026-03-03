import { IsNotEmpty, IsOptional, IsString, IsBoolean, IsInt, IsArray, IsDateString, IsEnum, ValidateNested, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CampaignStatus } from '@prisma/client';
import { PaginationDto } from '../../../../common/dto/pagination.dto';

export class CreateCampaignDto {
  @ApiProperty()
  @IsNotEmpty() @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  description?: string;

  @ApiProperty()
  @IsNotEmpty() @IsString()
  subject: string;

  @ApiProperty()
  @IsNotEmpty() @IsString()
  bodyHtml: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  bodyText?: string;

  @ApiProperty()
  @IsNotEmpty() @IsString()
  accountId: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  fromName?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  replyToEmail?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  templateId?: string;

  @ApiPropertyOptional()
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  sendRatePerMinute?: number;

  @ApiPropertyOptional()
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  batchSize?: number;

  @ApiPropertyOptional()
  @IsOptional() @IsBoolean()
  trackOpens?: boolean;

  @ApiPropertyOptional()
  @IsOptional() @IsBoolean()
  trackClicks?: boolean;

  @ApiPropertyOptional()
  @IsOptional() @IsBoolean()
  includeUnsubscribe?: boolean;

  @ApiPropertyOptional()
  @IsOptional() @IsDateString()
  scheduledAt?: string;
}

export class UpdateCampaignDto {
  @ApiPropertyOptional()
  @IsOptional() @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  subject?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  bodyHtml?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  bodyText?: string;

  @ApiPropertyOptional()
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  sendRatePerMinute?: number;

  @ApiPropertyOptional()
  @IsOptional() @IsDateString()
  scheduledAt?: string;
}

export class CampaignRecipientDto {
  @ApiProperty()
  @IsNotEmpty() @IsString()
  email: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  lastName?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  companyName?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  contactId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  mergeData?: Record<string, any>;
}

export class AddCampaignRecipientsDto {
  @ApiProperty({ type: [CampaignRecipientDto] })
  @IsArray() @ValidateNested({ each: true }) @Type(() => CampaignRecipientDto)
  recipients: CampaignRecipientDto[];
}

export class CampaignQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: CampaignStatus })
  @IsOptional() @IsEnum(CampaignStatus)
  status?: CampaignStatus;
}

export class CampaignRecipientQueryDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional() @IsString()
  status?: string;
}
