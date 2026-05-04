import { IsEnum, IsObject, IsOptional, IsString, Length } from 'class-validator';

export type OnboardingLocale = 'en' | 'hi' | 'mr';
export type OtpType = 'email' | 'mobile';
export type OnboardingUserType = 'B2B' | 'B2C' | 'IND_SP' | 'IND_EE';

export class SelectLocaleDto {
  @IsEnum(['en', 'hi', 'mr'])
  locale: OnboardingLocale;
}

export class SendOtpDto {
  @IsEnum(['email', 'mobile'])
  type: OtpType;
}

export class VerifyOtpDto {
  @IsEnum(['email', 'mobile'])
  type: OtpType;

  @IsString()
  @Length(6, 6)
  code: string;
}

export class SelectUserTypeDto {
  @IsEnum(['B2B', 'B2C', 'IND_SP', 'IND_EE'])
  userType: OnboardingUserType;
}

export class SetSubTypeDto {
  @IsString()
  subTypeCode: string;
}

export class CompleteProfileDto {
  @IsOptional()
  @IsString()
  verticalCode?: string;

  @IsOptional()
  @IsObject()
  profileFields?: Record<string, unknown>;
}
