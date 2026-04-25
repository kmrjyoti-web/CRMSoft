import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { OtpService } from '../../../softwarevendor/verification/services/otp.service';
import { OtpPurpose } from '@prisma/identity-client';
import type { OnboardingLocale, OtpType, OnboardingUserType, CompleteProfileDto } from './dto/onboarding.dto';

const STAGE_ORDER = [
  'language',
  'email_otp',
  'mobile_otp',
  'user_type',
  'vertical_profile',
  'complete',
] as const;

type OnboardingStage = typeof STAGE_ORDER[number];

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly otp: OtpService,
  ) {}

  async getStatus(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    return {
      stage: user.onboardingStage ?? 'language',
      emailVerified: user.emailVerified,
      mobileVerified: user.mobileVerified,
      locale: user.preferredLocale ?? 'en',
      complete: user.onboardingComplete ?? false,
    };
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

    const nextStage: OnboardingStage = type === 'email' ? 'mobile_otp' : 'user_type';

    if (type === 'email') {
      await this.prisma.user.update({
        where: { id: userId },
        data: { emailVerified: true, emailVerifiedAt: new Date(), onboardingStage: nextStage },
      });
    } else {
      await this.prisma.user.update({
        where: { id: userId },
        data: { mobileVerified: true, mobileVerifiedAt: new Date(), onboardingStage: nextStage },
      });
    }

    return { verified: true, nextStage };
  }

  async skipMobile(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { onboardingStage: 'user_type' },
    });
    return { nextStage: 'user_type' as OnboardingStage };
  }

  async selectUserType(userId: string, userType: OnboardingUserType) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { categoryCode: userType, onboardingStage: 'vertical_profile' },
    });
    return { nextStage: 'vertical_profile' as OnboardingStage };
  }

  async completeProfile(userId: string, dto: CompleteProfileDto) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        verticalCode: dto.verticalCode,
        registrationFields: (dto.profileFields ?? {}) as any,
        onboardingComplete: true,
        onboardingStage: 'complete',
      },
    });
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
