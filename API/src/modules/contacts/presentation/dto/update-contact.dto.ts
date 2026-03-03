import {
  IsString, IsOptional, IsArray, MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateContactDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(1) firstName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(1) lastName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() designation?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() department?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;

  @ApiPropertyOptional({ type: [String], description: 'Replace all filters' })
  @IsOptional() @IsArray()
  filterIds?: string[];
}
