import {
  IsString, IsOptional, IsArray, IsBoolean, IsEnum,
  ValidateNested, MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ContactCommunicationDto } from './create-contact.dto';

export class UpdateContactDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(1) firstName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(1) lastName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() designation?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() department?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;

  @ApiPropertyOptional({ type: [ContactCommunicationDto] })
  @IsOptional() @IsArray() @ValidateNested({ each: true })
  @Type(() => ContactCommunicationDto)
  communications?: ContactCommunicationDto[];

  @ApiPropertyOptional({ description: 'Link to existing Organization' })
  @IsOptional() @IsString()
  organizationId?: string;

  @ApiPropertyOptional({ type: [String], description: 'Replace all filters' })
  @IsOptional() @IsArray()
  filterIds?: string[];
}
