import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CommunicationsByEntityDto {
  @ApiProperty({ enum: ['rawContact', 'contact', 'organization', 'lead'] })
  @IsEnum(['rawContact', 'contact', 'organization', 'lead'])
  entityType: 'rawContact' | 'contact' | 'organization' | 'lead';

  @ApiProperty() @IsString()
  entityId: string;

  @ApiPropertyOptional({ enum: ['PHONE', 'EMAIL', 'MOBILE', 'ADDRESS', 'WHATSAPP'] })
  @IsOptional() @IsEnum(['PHONE', 'EMAIL', 'MOBILE', 'ADDRESS', 'WHATSAPP'])
  type?: string;
}
