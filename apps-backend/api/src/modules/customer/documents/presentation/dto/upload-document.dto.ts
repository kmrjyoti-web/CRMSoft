import { IsOptional, IsString, IsArray, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentCategory } from '@prisma/working-client';

export class UploadDocumentDto {
  @ApiPropertyOptional({ enum: DocumentCategory })
  @IsOptional() @IsEnum(DocumentCategory)
  category?: DocumentCategory;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  description?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional() @IsArray() @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  folderId?: string;
}
