import { IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSignatureDto {
  @ApiProperty()
  @IsNotEmpty() @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty() @IsString()
  bodyHtml: string;

  @ApiPropertyOptional()
  @IsOptional() @IsBoolean()
  isDefault?: boolean;
}

export class UpdateSignatureDto {
  @ApiPropertyOptional()
  @IsOptional() @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  bodyHtml?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsBoolean()
  isDefault?: boolean;
}
