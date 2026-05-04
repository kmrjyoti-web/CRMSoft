import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class ListCommunicationLogDto {
  @ApiProperty({ enum: ['CONTACT', 'ORGANIZATION', 'LEDGER'] })
  @IsEnum(['CONTACT', 'ORGANIZATION', 'LEDGER'])
  entityType: 'CONTACT' | 'ORGANIZATION' | 'LEDGER';

  @ApiProperty()
  @IsUUID()
  entityId: string;

  @ApiPropertyOptional({ enum: ['EMAIL', 'WHATSAPP'] })
  @IsOptional()
  @IsEnum(['EMAIL', 'WHATSAPP'])
  channel?: 'EMAIL' | 'WHATSAPP';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ minimum: 1, maximum: 200 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;
}
