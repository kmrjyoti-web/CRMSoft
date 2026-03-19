import { IsOptional, IsString, IsEnum, IsArray, IsDateString, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentCategory, StorageType } from '@prisma/client';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../../../common/dto/pagination.dto';

export class SearchDocumentsDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional() @IsString()
  query?: string;

  @ApiPropertyOptional({ enum: DocumentCategory })
  @IsOptional() @IsEnum(DocumentCategory)
  category?: DocumentCategory;

  @ApiPropertyOptional({ enum: StorageType })
  @IsOptional() @IsEnum(StorageType)
  storageType?: StorageType;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional() @IsArray() @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  uploadedById?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  mimeType?: string;

  @ApiPropertyOptional()
  @IsOptional() @Type(() => Number) @IsInt() @Min(0)
  minSize?: number;

  @ApiPropertyOptional()
  @IsOptional() @Type(() => Number) @IsInt() @Min(0)
  maxSize?: number;
}
