import {
  IsString, IsOptional, IsNumber, IsArray, IsEnum,
  IsDateString, Min, Max, IsObject, MaxLength,
} from 'class-validator';

export enum PostTypeEnum {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  PRODUCT_SHARE = 'PRODUCT_SHARE',
  CUSTOMER_FEEDBACK = 'CUSTOMER_FEEDBACK',
  PRODUCT_LAUNCH = 'PRODUCT_LAUNCH',
  POLL = 'POLL',
  ANNOUNCEMENT = 'ANNOUNCEMENT',
}

export enum VisibilityEnum {
  PUBLIC = 'PUBLIC',
  GEO_TARGETED = 'GEO_TARGETED',
  VERIFIED_ONLY = 'VERIFIED_ONLY',
  MY_CONTACTS = 'MY_CONTACTS',
  SELECTED_CONTACTS = 'SELECTED_CONTACTS',
  CATEGORY_BASED = 'CATEGORY_BASED',
  GRADE_BASED = 'GRADE_BASED',
}

export class CreatePostDto {
  @IsEnum(PostTypeEnum)
  postType: PostTypeEnum;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  content?: string;

  @IsOptional()
  @IsArray()
  mediaUrls?: any[];

  @IsOptional()
  @IsString()
  linkedListingId?: string;

  @IsOptional()
  @IsString()
  linkedOfferId?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsEnum(VisibilityEnum)
  visibility?: VisibilityEnum;

  @IsOptional()
  @IsObject()
  visibilityConfig?: any;

  @IsOptional()
  @IsDateString()
  publishAt?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hashtags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mentions?: string[];

  @IsOptional()
  @IsObject()
  pollConfig?: any;
}
