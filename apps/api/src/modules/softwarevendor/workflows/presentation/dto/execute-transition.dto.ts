import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ExecuteTransitionDto {
  @ApiProperty()
  @IsUUID()
  instanceId: string;

  @ApiProperty({ example: 'VERIFY' })
  @IsString()
  transitionCode: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiPropertyOptional()
  @IsOptional()
  data?: Record<string, any>;
}
