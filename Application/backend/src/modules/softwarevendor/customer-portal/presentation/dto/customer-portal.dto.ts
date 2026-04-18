import { IsString, IsEmail, IsOptional, IsBoolean, IsArray, IsObject, MinLength, IsIn } from 'class-validator';

// ── Menu Category DTOs ────────────────────────────────────────────────────────

export class CreateMenuCategoryDto {
  @IsString() @MinLength(2)
  name: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsString()
  icon?: string;

  @IsOptional() @IsString()
  color?: string;

  @IsOptional() @IsArray()
  enabledRoutes?: string[];

  @IsOptional() @IsBoolean()
  isDefault?: boolean;
}

export class UpdateMenuCategoryDto {
  @IsOptional() @IsString() @MinLength(2)
  name?: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsString()
  icon?: string;

  @IsOptional() @IsString()
  color?: string;

  @IsOptional() @IsArray()
  enabledRoutes?: string[];

  @IsOptional() @IsBoolean()
  isDefault?: boolean;

  @IsOptional() @IsBoolean()
  isActive?: boolean;
}

// ── Portal Activation DTOs ────────────────────────────────────────────────────

export class ActivatePortalDto {
  @IsString()
  @IsIn(['CONTACT', 'ORGANIZATION', 'LEDGER'])
  linkedEntityType: string;

  @IsString()
  linkedEntityId: string;

  @IsString()
  linkedEntityName: string;

  @IsEmail()
  email: string;

  @IsOptional() @IsString()
  displayName?: string;

  @IsOptional() @IsString()
  menuCategoryId?: string;
}

// ── Page Overrides DTO ────────────────────────────────────────────────────────

export class UpdatePageOverridesDto {
  @IsObject()
  pageOverrides: Record<string, boolean>;
}

// ── Customer Login DTO ────────────────────────────────────────────────────────

export class CustomerPortalLoginDto {
  @IsEmail()
  email: string;

  @IsString() @MinLength(6)
  password: string;
}

// ── Password Reset DTOs ───────────────────────────────────────────────────────

export class RequestPasswordResetDto {
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @IsString()
  token: string;

  @IsString() @MinLength(6)
  newPassword: string;
}
