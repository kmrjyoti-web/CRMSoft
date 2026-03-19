import { IsOptional, IsString, IsEnum, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentCategory, StorageType } from '@prisma/client';
import { PaginationDto } from '../../../../../common/dto/pagination.dto';

export class DocumentQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: DocumentCategory })
  @IsOptional() @IsEnum(DocumentCategory)
  category?: DocumentCategory;

  @ApiPropertyOptional({ enum: StorageType })
  @IsOptional() @IsEnum(StorageType)
  storageType?: StorageType;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  folderId?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  uploadedById?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional() @IsArray() @IsString({ each: true })
  tags?: string[];
}
