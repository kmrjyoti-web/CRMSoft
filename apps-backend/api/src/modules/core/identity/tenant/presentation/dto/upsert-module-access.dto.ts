import {
  IsString, IsOptional, IsEnum, IsArray, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ModuleAccessLevel } from '@prisma/identity-client';

class ModuleAccessItemDto {
  @ApiProperty({ description: 'Module code identifier' })
  @IsString()
  moduleCode: string;

  @ApiProperty({ enum: ModuleAccessLevel, description: 'Access level for this module' })
  @IsEnum(ModuleAccessLevel)
  accessLevel: string;

  @ApiPropertyOptional({ description: 'Custom configuration for this module (JSON)' })
  @IsOptional()
  customConfig?: Record<string, unknown>;
}

export class UpsertModuleAccessDto {
  @ApiProperty({ description: 'List of module access entries', type: [ModuleAccessItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ModuleAccessItemDto)
  modules: ModuleAccessItemDto[];
}
