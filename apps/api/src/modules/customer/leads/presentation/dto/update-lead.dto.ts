import {
  IsString, IsOptional, IsEnum, IsNumber, IsDateString, IsArray, Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateLeadDto {
  @ApiPropertyOptional({ enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] })
  @IsOptional() @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority?: string;

  @ApiPropertyOptional({ example: 75000 })
  @IsOptional() @IsNumber() @Min(0)
  expectedValue?: number;

  @ApiPropertyOptional({ example: '2026-06-30' })
  @IsOptional() @IsDateString()
  expectedCloseDate?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  notes?: string;

  @ApiPropertyOptional({ type: [String], description: 'Replace all filters' })
  @IsOptional() @IsArray()
  filterIds?: string[];
}
