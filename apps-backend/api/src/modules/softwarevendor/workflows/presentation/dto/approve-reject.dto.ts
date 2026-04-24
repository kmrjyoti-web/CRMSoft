import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ApproveRejectDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comment?: string;
}
