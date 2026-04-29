import { IsEmail, IsString, MinLength, IsOptional, IsUUID, IsEnum, IsNumber, Matches, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ─── SHARED ───

export class LoginDto {
  @ApiProperty({ example: 'admin@crm.com' }) @IsEmail() email: string;
  @ApiProperty({ example: 'Admin@123' }) @IsString() @MinLength(6) password: string;
  @ApiPropertyOptional({ description: 'Tenant slug for tenant-scoped login' })
  @IsOptional() @IsString() tenantSlug?: string;
}

export class RefreshTokenDto {
  @ApiProperty() @IsString() refreshToken: string;
}

export class ChangePasswordDto {
  @ApiProperty() @IsString() @MinLength(6) currentPassword: string;
  @ApiProperty() @IsString() @MinLength(6) newPassword: string;
}

// ─── ADMIN/EMPLOYEE REGISTER (admin creates) ───

export class RegisterDto {
  @ApiProperty({ example: 'john@crm.com' }) @IsEmail() email: string;
  @ApiProperty({ example: 'Pass@123' }) @IsString() @MinLength(6) password: string;
  @ApiProperty({ example: 'John' }) @IsString() firstName: string;
  @ApiProperty({ example: 'Doe' }) @IsString() lastName: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiProperty() @IsUUID() roleId: string;
  @ApiPropertyOptional({ enum: ['ADMIN', 'EMPLOYEE'] })
  @IsOptional() @IsEnum(['ADMIN', 'EMPLOYEE'])
  userType?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() departmentId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() designationId?: string;
}

// ─── CUSTOMER SELF-REGISTER (public) ───

export class CustomerRegisterDto {
  @ApiProperty({ example: 'customer@gmail.com' }) @IsEmail() email: string;
  @ApiProperty({ example: 'Cust@123' }) @IsString() @MinLength(6) password: string;
  @ApiProperty({ example: 'Vikram' }) @IsString() firstName: string;
  @ApiProperty({ example: 'Sharma' }) @IsString() lastName: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() companyName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() gstNumber?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() city?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() state?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() country?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() industry?: string;
}

// ─── REFERRAL PARTNER SELF-REGISTER (public) ───

export class PartnerRegisterDto {
  @ApiProperty({ example: 'partner@gmail.com' }) @IsEmail() email: string;
  @ApiProperty({ example: 'Part@123' }) @IsString() @MinLength(6) password: string;
  @ApiProperty({ example: 'Suresh' }) @IsString() firstName: string;
  @ApiProperty({ example: 'Kumar' }) @IsString() lastName: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() panNumber?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() bankName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() bankAccount?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() ifscCode?: string;
}

// ─── TENANT SELF-REGISTER (public) ───

export class VerticalRegisterDto {
  @ApiProperty({ example: 'CUSTOMER' })
  @IsString() categoryCode: string;

  @ApiProperty({ example: 'TRAVELER' })
  @IsString() subcategoryCode: string;

  @ApiProperty({ example: 'travvellis' })
  @IsString() brandCode: string;

  @ApiProperty({ example: 'traveler@world.com' })
  @IsEmail() email: string;

  @ApiProperty({ example: 'Pass@12345' })
  @IsString() @MinLength(8) password: string;

  @ApiPropertyOptional({ example: { full_name: 'Alice', phone: '+91-9876543210', country: 'India' } })
  @IsOptional() @IsObject() registrationFields?: Record<string, any>;
}

// ─── DYNAMIC REGISTRATION (M4 — config-driven) ───

export class DynamicRegisterDto {
  @ApiProperty({ example: 'B2B_TRAV_TRAVL_DMC' })
  @IsString() combinedCode: string;

  @ApiProperty({ example: 'travvellis' })
  @IsString() brandCode: string;

  @ApiProperty({ example: 'TRAVEL_TOURISM' })
  @IsString() verticalCode: string;

  @ApiProperty({ example: 'B2B' })
  @IsString() userType: string;

  @ApiProperty({ example: 'DMC_PROVIDER' })
  @IsString() subTypeCode: string;

  @ApiProperty({ example: 'dmc@agency.com' })
  @IsEmail() email: string;

  @ApiProperty({ example: 'Pass@12345' })
  @IsString() @MinLength(8) password: string;

  @ApiPropertyOptional({ example: '+91-9876543210' })
  @IsOptional() @IsString() mobile?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsObject() fields?: Record<string, any>;
}

// ─── UNIVERSAL LOGIN (brand portals) ───

export class UniversalLoginDto {
  @ApiProperty({ example: 'user@travvellis.com' }) @IsEmail() email: string;
  @ApiProperty({ example: 'Pass@12345' }) @IsString() @MinLength(6) password: string;
}

// ─── SWITCH COMPANY ───

export class SwitchCompanyDto {
  @ApiProperty({ description: 'Company ID to switch context to' }) @IsUUID() companyId: string;
}

// ─── TENANT REGISTER ───

export class TenantRegisterDto {
  @ApiProperty({ example: 'Acme Corp' })
  @IsString() companyName: string;

  @ApiProperty({ example: 'acme-corp', description: 'URL-safe tenant slug' })
  @IsString() @Matches(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, { message: 'Slug must be lowercase alphanumeric with hyphens' })
  slug: string;

  @ApiProperty({ example: 'admin@acme.com' })
  @IsEmail() email: string;

  @ApiProperty({ example: 'Admin@123' })
  @IsString() @MinLength(6) password: string;

  @ApiProperty({ example: 'John' })
  @IsString() firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString() lastName: string;

  @ApiPropertyOptional({ example: '+91-9876543210' })
  @IsOptional() @IsString() phone?: string;

  @ApiPropertyOptional({ description: 'Plan ID to subscribe to (defaults to first active plan)' })
  @IsOptional() @IsUUID() planId?: string;

  @ApiPropertyOptional({ description: 'Business type code (e.g., IT_SERVICES, RESTAURANT_FOOD)' })
  @IsOptional() @IsString() businessTypeCode?: string;

  @ApiPropertyOptional({ description: 'Domain the user registered from (used to link WL parent tenant)' })
  @IsOptional() @IsString() registeredOnDomain?: string;
}

// ─── CENTRAL AUTH (Sprint 7.1) ───

export class CentralLoginDto {
  @ApiProperty({ example: 'user@company.com' }) @IsEmail() email: string;
  @ApiProperty({ example: 'Pass@12345' }) @IsString() @MinLength(1) password: string;
}

export class SelectTenantDto {
  @ApiProperty({ description: 'Session token from MULTI central-login response' })
  @IsString() sessionToken: string;

  @ApiProperty({ description: 'Company ID the user selected' })
  @IsString() companyId: string;
}

export class SsoVerifyDto {
  @ApiProperty({ description: 'SSO token from redirectUrl ?sso= param (60s TTL)' })
  @IsString() ssoToken: string;
}