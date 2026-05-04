import { IsString, IsEnum, IsOptional, IsNumber, Min, Max } from 'class-validator';

export enum StorageEntityType {
  LISTING = 'listing',
  POST = 'post',
  REVIEW = 'review',
  OFFER = 'offer',
}

export class PresignedUrlDto {
  @IsEnum(StorageEntityType)
  entityType: StorageEntityType;

  @IsString()
  entityId: string;

  @IsString()
  filename: string;

  @IsString()
  contentType: string;

  @IsOptional()
  @IsNumber()
  @Min(60)
  @Max(86400)
  expiresIn?: number;
}
