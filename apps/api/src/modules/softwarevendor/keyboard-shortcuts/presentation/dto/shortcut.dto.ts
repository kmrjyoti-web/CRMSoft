import { IsString, IsOptional, IsBoolean, IsNotEmpty } from 'class-validator';

export class UpsertOverrideDto {
  @IsString()
  @IsNotEmpty()
  customKey: string;
}

export class CreateCustomShortcutDto {
  @IsString()
  @IsNotEmpty()
  label: string;

  @IsString()
  @IsNotEmpty()
  defaultKey: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  targetPath?: string;

  @IsString()
  @IsOptional()
  targetModule?: string;
}

export class UpdateDefinitionDto {
  @IsString()
  @IsOptional()
  label?: string;

  @IsString()
  @IsOptional()
  defaultKey?: string;

  @IsBoolean()
  @IsOptional()
  isLocked?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class CheckConflictDto {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsString()
  @IsOptional()
  excludeShortcutId?: string;
}
