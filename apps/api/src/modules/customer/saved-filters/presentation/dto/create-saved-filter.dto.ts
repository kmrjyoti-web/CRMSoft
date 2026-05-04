import { IsString, IsOptional, IsBoolean, IsObject, MaxLength } from 'class-validator';

export class CreateSavedFilterDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  entityType: string;

  @IsObject()
  filterConfig: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsBoolean()
  isShared?: boolean;

  @IsOptional()
  sharedWithRoles?: string[];
}
