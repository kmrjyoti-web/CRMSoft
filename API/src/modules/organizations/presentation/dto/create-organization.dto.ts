import {
  IsString, IsOptional, IsEmail, IsArray, MinLength, IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrganizationDto {
  @ApiProperty({ example: 'TechCorp India Pvt. Ltd.' })
  @IsString() @MinLength(2)
  name: string;

  @ApiPropertyOptional({ example: 'https://techcorp.in' })
  @IsOptional() @IsString()
  website?: string;

  @ApiPropertyOptional({ example: 'contact@techcorp.in' })
  @IsOptional() @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+91-22-12345678' })
  @IsOptional() @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: '27AABCT1234E1Z5' })
  @IsOptional() @IsString()
  gstNumber?: string;

  @ApiPropertyOptional({ example: '123, Business Park, Andheri East' })
  @IsOptional() @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'Mumbai' })
  @IsOptional() @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'Maharashtra' })
  @IsOptional() @IsString()
  state?: string;

  @ApiPropertyOptional({ example: 'India' })
  @IsOptional() @IsString()
  country?: string;

  @ApiPropertyOptional({ example: '400093' })
  @IsOptional() @IsString()
  pincode?: string;

  @ApiPropertyOptional({ example: 'IT / Software' })
  @IsOptional() @IsString()
  industry?: string;

  @ApiPropertyOptional() @IsOptional() @IsNumber()
  annualRevenue?: number;

  @ApiPropertyOptional() @IsOptional() @IsString()
  notes?: string;

  @ApiPropertyOptional({ type: [String], description: 'LookupValue IDs for filters' })
  @IsOptional() @IsArray()
  filterIds?: string[];
}
