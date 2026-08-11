import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateLookupDto {
  @ApiPropertyOptional() @IsOptional() @IsString()
  displayName?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  description?: string;
}
