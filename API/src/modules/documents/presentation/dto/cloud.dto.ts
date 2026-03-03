import { IsNotEmpty, IsString, IsOptional, IsEnum, IsDateString, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StorageProvider, DocumentCategory } from '@prisma/client';

export class ConnectCloudDto {
  @ApiProperty({ enum: StorageProvider })
  @IsNotEmpty() @IsEnum(StorageProvider)
  provider: StorageProvider;

  @ApiProperty()
  @IsNotEmpty() @IsString()
  accessToken: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  refreshToken?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsDateString()
  tokenExpiry?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  accountEmail?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  accountName?: string;
}

export class LinkCloudFileDto {
  @ApiProperty()
  @IsNotEmpty() @IsUrl()
  url: string;

  @ApiPropertyOptional({ enum: DocumentCategory })
  @IsOptional() @IsEnum(DocumentCategory)
  category?: DocumentCategory;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  description?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  folderId?: string;
}
