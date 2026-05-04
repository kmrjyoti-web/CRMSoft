import { IsString, IsOptional, IsEnum, IsNumber, IsObject } from 'class-validator';

export enum AnalyticsEntityTypeEnum {
  POST = 'POST',
  LISTING = 'LISTING',
  OFFER = 'OFFER',
}

export enum AnalyticsEventTypeEnum {
  IMPRESSION = 'IMPRESSION',
  CLICK = 'CLICK',
  ENQUIRY = 'ENQUIRY',
  LEAD = 'LEAD',
  CUSTOMER = 'CUSTOMER',
  ORDER = 'ORDER',
  SHARE = 'SHARE',
  SAVE = 'SAVE',
}

export enum AnalyticsSourceEnum {
  FEED = 'FEED',
  SEARCH = 'SEARCH',
  SHARE_LINK = 'SHARE_LINK',
  DIRECT = 'DIRECT',
  NOTIFICATION = 'NOTIFICATION',
  QR_CODE = 'QR_CODE',
  EXTERNAL = 'EXTERNAL',
}

export class TrackEventDto {
  @IsEnum(AnalyticsEntityTypeEnum)
  entityType: AnalyticsEntityTypeEnum;

  @IsString()
  entityId: string;

  @IsEnum(AnalyticsEventTypeEnum)
  eventType: AnalyticsEventTypeEnum;

  @IsOptional()
  @IsEnum(AnalyticsSourceEnum)
  source?: AnalyticsSourceEnum;

  @IsOptional()
  @IsString()
  deviceType?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  pincode?: string;

  @IsOptional()
  @IsNumber()
  orderValue?: number;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
