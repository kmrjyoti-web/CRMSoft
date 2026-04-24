import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRawContactDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(1) firstName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(1) lastName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() companyName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() designation?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() department?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}
