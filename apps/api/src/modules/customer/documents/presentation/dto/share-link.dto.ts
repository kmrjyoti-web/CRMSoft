import { IsOptional, IsString, IsEnum, IsInt, IsDateString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ShareLinkAccess } from '@prisma/working-client';
import { Type } from 'class-transformer';

export class CreateShareLinkDto {
  @ApiPropertyOptional({ enum: ShareLinkAccess })
  @IsOptional() @IsEnum(ShareLinkAccess)
  access?: ShareLinkAccess;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  password?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional()
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  maxViews?: number;
}

export class AccessShareLinkDto {
  @ApiPropertyOptional()
  @IsOptional() @IsString()
  password?: string;
}
