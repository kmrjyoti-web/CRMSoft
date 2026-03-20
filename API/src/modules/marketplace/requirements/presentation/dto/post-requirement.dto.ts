import { IsString, IsOptional, IsNumber, IsDateString, IsArray, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PostRequirementDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(1)
  @IsOptional()
  quantity?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  targetPrice?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  deadline?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsOptional()
  mediaUrls?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsOptional()
  keywords?: string[];
}
