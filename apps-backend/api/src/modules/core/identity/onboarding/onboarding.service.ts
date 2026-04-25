import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { OtpService } from '../../../softwarevendor/verification/services/otp.service';
import { OtpPurpose } from '@prisma/identity-client';
import type { OnboardingLocale, OtpType, OnboardingUserType, CompleteProfileDto, SetSubTypeDto } from './dto/onboarding.dto';

const STAGE_ORDER = [
  'language',
  'email_otp',
  'mobile_otp',
  'user_type',
  'sub_user_type',
  'profile_redirect',
  'complete',
] as const;

type OnboardingStage = typeof STAGE_ORDER[number];

// Maps simplified onboarding codes → canonical PC category codes
const USER_TYPE_TO_CATEGORY: Record<OnboardingUserType, string> = {
  B2B:    'COMPANY_B2B',
  B2C:    'COMPANY_B2C',
  IND_SP: 'INDIVIDUAL_SP',
  IND_EE: 'EMPLOYEE',
};

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly otp: OtpService,
  ) {}

  async getStatus(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });

    const complete = user.onboardingComplete ?? false;
    let stage: OnboardingStage;

    if (complete) {
      stage = 'complete';
    } else {
      stage = this.computeNextStage(user);
    }

    return {
      stage,
      emailVerified: user.emailVerified,
      mobileVerified: user.mobileVerified,
      categoryCode: (user as any).categoryCode ?? null,
      subcategoryCode: (user as any).subcategoryCode ?? null,
      verticalCode: (user as any).verticalCode ?? null,
      brandCode: (user as any).brandCode ?? null,
      locale: user.preferredLocale ?? 'en',
      complete,
    };
  }

  private computeNextStage(user: any): OnboardingStage {
    // Language: show if onboarding hasn't started (stage null or default 'language').
    // Do NOT use preferredLocale — it defaults to 'en' for all new users in the DB.
    const notStarted = !user.onboardingStage || user.onboardingStage === 'language';
    if (notStarted) return 'language';

    // Email OTP: always required
    if (!user.emailVerified) return 'email_otp';

    // Mobile OTP: use stored stage as skip indicator (skipMobile advances stored stage past mobile_otp).
    // If the stored stage is an old/unknown value (indexOf returns -1), treat as past mobile_otp.
    const storedStage = user.onboardingStage ?? 'language';
    const rawIdx = STAGE_ORDER.indexOf(storedStage as OnboardingStage);
    const storedIdx = rawIdx === -1 ? STAGE_ORDER.length : rawIdx;
    const mobileIdx = STAGE_ORDER.indexOf('mobile_otp');
    if (storedIdx <= mobileIdx && !user.mobileVerified) return 'mobile_otp';

    // User type: skip if categoryCode already set (from registration)
    if (!user.categoryCode) return 'user_type';

    // Sub-type: skip if subcategoryCode already set (from registration)
    if (!user.subcategoryCode) return 'sub_user_type';

    // Everything set → profile redirect
    return 'profile_redirect';
  }

  async selectLocale(userId: string, locale: OnboardingLocale) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        preferredLocale: locale,
        onboardingStage: 'email_otp',
      },
    });
    return { nextStage: 'email_otp' as OnboardingStage };
  }

  async sendOtp(userId: string, type: OtpType, ip?: string, ua?: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });

    const target = type === 'email' ? user.email : (user.phone ?? null);
    if (!target) {
      throw new BadRequestException(`No ${type} on file for this user`);
    }

    const purpose: OtpPurpose =
      type === 'email' ? OtpPurpose.EMAIL_VERIFICATION : OtpPurpose.MOBILE_VERIFICATION;

    const result = await this.otp.sendOtp({
      target,
      targetType: type === 'email' ? 'EMAIL' : 'MOBILE',
      purpose,
      userId,
      ipAddress: ip,
      userAgent: ua,
    });

    return {
      sentTo: this.maskTarget(target, type),
      expiresAt: result.expiresAt,
    };
  }

  async verifyOtp(userId: string, type: OtpType, code: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });

    const target = type === 'email' ? user.email : (user.phone ?? null);
    if (!target) throw new BadRequestException(`No ${type} on file`);

    const purpose: OtpPurpose =
      type === 'email' ? OtpPurpose.EMAIL_VERIFICATION : OtpPurpose.MOBILE_VERIFICATION;

    await this.otp.verifyOtp({
      target,
      targetType: type === 'email' ? 'EMAIL' : 'MOBILE',
      purpose,
      otp: code,
      userId,
    });

    if (type === 'email') {
      await this.prisma.user.update({
        where: { id: userId },
        data: { emailVerified: true, emailVerifiedAt: new Date(), onboardingStage: 'mobile_otp' },
      });
    } else {
      await this.prisma.user.update({
        where: { id: userId },
        data: { mobileVerified: true, mobileVerifiedAt: new Date(), onboardingStage: 'user_type' },
      });
    }

    const updated = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    return { verified: true, nextStage: this.computeNextStage(updated) };
  }

  async skipMobile(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { onboardingStage: 'user_type' },
    });
    return { nextStage: 'user_type' as OnboardingStage };
  }

  async selectUserType(userId: string, userType: OnboardingUserType) {
    const canonicalCode = USER_TYPE_TO_CATEGORY[userType] ?? userType;
    await this.prisma.user.update({
      where: { id: userId },
      data: { categoryCode: canonicalCode, onboardingStage: 'sub_user_type' } as any,
    });
    return { nextStage: 'sub_user_type' as OnboardingStage };
  }

  async setSubType(userId: string, dto: SetSubTypeDto) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { subcategoryCode: dto.subTypeCode, onboardingStage: 'profile_redirect' } as any,
    });
    return { nextStage: 'profile_redirect' as OnboardingStage };
  }

  async completeProfile(userId: string, dto: CompleteProfileDto) {
    const data: any = {
      onboardingComplete: true,
      onboardingStage: 'complete',
      registrationFields: (dto.profileFields ?? {}) as any,
    };
    if (dto.verticalCode) {
      data.verticalCode = dto.verticalCode;
    }
    await this.prisma.user.update({ where: { id: userId }, data });
    return { success: true, redirectTo: '/dashboard' };
  }

  private maskTarget(target: string, type: OtpType): string {
    if (type === 'email') {
      const [local, domain] = target.split('@');
      const visible = local.slice(0, 2);
      const masked = '•'.repeat(Math.max(0, local.length - 3));
      return `${visible}${masked}${local.slice(-1)}@${domain}`;
    }
    return `${target.slice(0, 3)}${'•'.repeat(Math.max(0, target.length - 5))}${target.slice(-2)}`;
  }
}
