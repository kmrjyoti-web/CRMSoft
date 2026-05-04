import {
  IsBoolean, IsOptional, IsString, IsArray, IsInt, Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateNotifPrefDto {
  @IsOptional() @IsBoolean() inAppEnabled?: boolean;
  @IsOptional() @IsBoolean() emailEnabled?: boolean;
  @IsOptional() @IsBoolean() smsEnabled?: boolean;
  @IsOptional() @IsBoolean() whatsappEnabled?: boolean;
  @IsOptional() @IsBoolean() pushEnabled?: boolean;
  @IsOptional() @IsBoolean() notifyOwner?: boolean;
  @IsOptional() @IsBoolean() notifyCreator?: boolean;
  @IsOptional() @IsBoolean() notifyManager?: boolean;
  @IsOptional() @IsBoolean() notifyAdmin?: boolean;
  @IsOptional() @IsArray() @IsString({ each: true }) customRecipientIds?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) customRecipientEmails?: string[];
  @IsOptional() @IsBoolean() isRealtime?: boolean;
  @IsOptional() @IsInt() @Min(1) delayMinutes?: number;
  @IsOptional() @IsBoolean() digestMode?: boolean;
  @IsOptional() @IsString() emailTemplateId?: string;
  @IsOptional() @IsString() emailSubject?: string;
  @IsOptional() @IsString() customMessage?: string;
  @IsOptional() @IsBoolean() isEnabled?: boolean;
}

export class BulkUpdateNotifPrefDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkNotifItem)
  updates: BulkNotifItem[];
}

class BulkNotifItem {
  @IsString() eventCode: string;
  @IsOptional() @IsBoolean() inAppEnabled?: boolean;
  @IsOptional() @IsBoolean() emailEnabled?: boolean;
  @IsOptional() @IsBoolean() smsEnabled?: boolean;
  @IsOptional() @IsBoolean() whatsappEnabled?: boolean;
  @IsOptional() @IsBoolean() pushEnabled?: boolean;
  @IsOptional() @IsBoolean() isEnabled?: boolean;
}
