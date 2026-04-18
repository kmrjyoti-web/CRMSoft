import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class RejectRawContactDto {
  @ApiPropertyOptional({ example: 'Invalid contact details' })
  @IsOptional() @IsString()
  reason?: string;
}
