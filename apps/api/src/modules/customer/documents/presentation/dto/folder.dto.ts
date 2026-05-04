import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFolderDto {
  @ApiProperty()
  @IsNotEmpty() @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  parentId?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  color?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  icon?: string;
}

export class UpdateFolderDto {
  @ApiPropertyOptional()
  @IsOptional() @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  color?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  icon?: string;
}
