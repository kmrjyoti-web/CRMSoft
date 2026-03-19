import { IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EmailDirection, EmailStatus } from '@prisma/client';
import { PaginationDto } from '../../../../../common/dto/pagination.dto';
import { Type } from 'class-transformer';

export class EmailQueryDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional() @IsString()
  accountId?: string;

  @ApiPropertyOptional({ enum: EmailDirection })
  @IsOptional() @IsEnum(EmailDirection)
  direction?: EmailDirection;

  @ApiPropertyOptional({ enum: EmailStatus })
  @IsOptional() @IsEnum(EmailStatus)
  status?: EmailStatus;

  @ApiPropertyOptional()
  @IsOptional() @Type(() => Boolean) @IsBoolean()
  isStarred?: boolean;

  @ApiPropertyOptional()
  @IsOptional() @Type(() => Boolean) @IsBoolean()
  isRead?: boolean;
}

export class SearchEmailsDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional() @IsString()
  query?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  accountId?: string;
}
