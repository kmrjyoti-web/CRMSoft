import { IsBoolean, IsObject, IsOptional, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePortalUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  menuCategoryId?: string;

  @ApiPropertyOptional({
    description: 'Per-route visibility overrides. true=show, false=hide',
    example: { '/ledger': true, '/employees': false },
  })
  @IsOptional()
  @IsObject()
  pageOverrides?: Record<string, boolean>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
