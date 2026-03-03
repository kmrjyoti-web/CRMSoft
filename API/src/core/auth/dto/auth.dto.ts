import { IsEmail, IsString, MinLength, IsOptional, IsUUID, IsEnum, IsNumber } from 'class-validator';
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