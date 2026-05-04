import { IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTicketDto {
  @ApiProperty({ description: 'Ticket subject' })
  @IsString()
  subject: string;

  @ApiProperty({ description: 'Ticket description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Ticket category', example: 'BUG' })
  @IsString()
  category: string;

  @ApiProperty({ description: 'Ticket priority', example: 'MEDIUM' })
  @IsString()
  priority: string;

  @ApiPropertyOptional({ description: 'Screenshot URLs', type: [String] })
  @IsOptional()
  @IsArray()
  screenshots?: string[];

  @ApiPropertyOptional({
    description: 'Linked error log IDs',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  linkedErrorIds?: string[];
}
