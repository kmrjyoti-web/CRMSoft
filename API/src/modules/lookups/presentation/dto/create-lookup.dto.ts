import { IsString, IsOptional, IsBoolean, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLookupDto {
  @ApiProperty({ example: 'INDUSTRY', description: 'Auto-uppercased, spaces → underscores' })
  @IsString() @MinLength(2)
  category: string;

  @ApiProperty({ example: 'Industry' })
  @IsString() @MinLength(2)
  displayName: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  description?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional() @IsBoolean()
  isSystem?: boolean;
}
