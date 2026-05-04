import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendQuotationDto {
  @ApiProperty() @IsIn(['EMAIL', 'WHATSAPP', 'PORTAL', 'MANUAL', 'DOWNLOAD']) channel: string;
  @ApiPropertyOptional() @IsOptional() @IsString() receiverContactId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() receiverEmail?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() receiverPhone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() message?: string;
}
