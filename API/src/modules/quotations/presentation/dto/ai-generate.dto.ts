import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AiPredictDto {
  @ApiProperty() @IsString() leadId: string;
}

export class AiGenerateDto {
  @ApiProperty() @IsString() leadId: string;
  @ApiPropertyOptional() @IsOptional() @IsObject() answers?: Record<string, any>;
  @ApiPropertyOptional() @IsOptional() @IsString() templateId?: string;
}
