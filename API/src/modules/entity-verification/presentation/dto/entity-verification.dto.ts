import { IsString, IsEnum, IsOptional, IsNotEmpty } from 'class-validator';

export class InitiateVerificationDto {
  @IsString() @IsNotEmpty() entityType: string;  // CONTACT, ORGANIZATION, RAW_CONTACT
  @IsString() @IsNotEmpty() entityId: string;
  @IsEnum(['OTP', 'LINK']) mode: string;
  @IsEnum(['EMAIL', 'MOBILE_SMS', 'WHATSAPP']) channel: string;
}

export class VerifyOtpDto {
  @IsString() @IsNotEmpty() recordId: string;
  @IsString() @IsNotEmpty() otp: string;
}

export class RejectVerificationDto {
  @IsString() @IsOptional() reason?: string;
}
