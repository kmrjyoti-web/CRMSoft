import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { OtpPurpose } from '@prisma/identity-client';

interface SendOtpParams {
  target: string;
  targetType: 'EMAIL' | 'MOBILE';
  purpose: OtpPurpose;
  userId?: string;
  tenantId?: string;
  ipAddress?: string;
  userAgent?: string;
}

interface VerifyOtpParams {
  target: string;
  targetType: 'EMAIL' | 'MOBILE';
  purpose: OtpPurpose;
  otp: string;
  userId?: string;
}

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private readonly OTP_LENGTH = 6;
  private readonly OTP_EXPIRY_MINUTES = 10;
  private readonly MAX_ATTEMPTS = 3;
  private readonly RESEND_COOLDOWN_SECONDS = 60;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Generate and send OTP.
   */
  async sendOtp(params: SendOtpParams): Promise<{ success: boolean; message: string; expiresAt: Date }> {
    const { target, targetType, purpose, userId, tenantId, ipAddress, userAgent } = params;

    // Check cooldown (prevent spam)
    const recentOtp = await this.prisma.verificationOtp.findFirst({
      where: {
        target,
        purpose,
        status: 'OTP_PENDING',
        createdAt: {
          gte: new Date(Date.now() - this.RESEND_COOLDOWN_SECONDS * 1000),
        },
      },
    });

    if (recentOtp) {
      const waitSeconds = Math.ceil(
        (recentOtp.createdAt.getTime() + this.RESEND_COOLDOWN_SECONDS * 1000 - Date.now()) / 1000,
      );
      throw new BadRequestException(
        `Please wait ${waitSeconds} seconds before requesting another OTP`,
      );
    }

    // Invalidate any existing pending OTPs
    await this.prisma.verificationOtp.updateMany({
      where: { target, purpose, status: 'OTP_PENDING' },
      data: { status: 'OTP_EXPIRED' },
    });

    // Generate OTP
    const otpPlain = this.generateOtp();
    const otpHash = this.hashOtp(otpPlain);
    const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);

    // Store OTP
    await this.prisma.verificationOtp.create({
      data: {
        tenantId,
        userId,
        target,
        targetType,
        otp: otpHash,
        purpose,
        expiresAt,
        ipAddress,
        userAgent,
      },
    });

    // Send OTP via email or SMS
    if (targetType === 'EMAIL') {
      await this.sendEmailOtp(target, otpPlain, purpose);
    } else {
      await this.sendSmsOtp(target, otpPlain, purpose);
    }

    this.logger.log(`OTP sent to ${targetType}: ${this.maskTarget(target)}`);

    return {
      success: true,
      message: `OTP sent to your ${targetType.toLowerCase()}`,
      expiresAt,
    };
  }

  /**
   * Verify OTP.
   */
  async verifyOtp(params: VerifyOtpParams): Promise<{ success: boolean; message: string }> {
    const { target, purpose, otp } = params;

    // Find pending OTP
    const otpRecord = await this.prisma.verificationOtp.findFirst({
      where: {
        target,
        purpose,
        status: 'OTP_PENDING',
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new BadRequestException('OTP expired or not found. Please request a new one.');
    }

    // Check attempts
    if (otpRecord.attempts >= this.MAX_ATTEMPTS) {
      await this.prisma.verificationOtp.update({
        where: { id: otpRecord.id },
        data: { status: 'OTP_FAILED' },
      });
      throw new BadRequestException('Too many failed attempts. Please request a new OTP.');
    }

    // Verify OTP
    const otpHash = this.hashOtp(otp);

    if (otpHash !== otpRecord.otp) {
      await this.prisma.verificationOtp.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } },
      });

      const remainingAttempts = this.MAX_ATTEMPTS - otpRecord.attempts - 1;
      throw new BadRequestException(
        `Invalid OTP. ${remainingAttempts} attempt(s) remaining.`,
      );
    }

    // Mark as verified
    await this.prisma.verificationOtp.update({
      where: { id: otpRecord.id },
      data: { status: 'OTP_VERIFIED', verifiedAt: new Date() },
    });

    this.logger.log(`OTP verified for ${params.targetType}: ${this.maskTarget(target)}`);

    return {
      success: true,
      message: `${params.targetType === 'EMAIL' ? 'Email' : 'Mobile'} verified successfully`,
    };
  }

  /** Generate numeric OTP. */
  private generateOtp(): string {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < this.OTP_LENGTH; i++) {
      otp += digits[crypto.randomInt(0, digits.length)];
    }
    return otp;
  }

  /** Hash OTP for storage. */
  private hashOtp(otp: string): string {
    return crypto.createHash('sha256').update(otp).digest('hex');
  }

  /** Mask target for logging. */
  private maskTarget(target: string): string {
    if (target.includes('@')) {
      const [local, domain] = target.split('@');
      return `${local.slice(0, 2)}***@${domain}`;
    }
    return `***${target.slice(-4)}`;
  }

  /** Send OTP via email (integrate with your email service). */
  private async sendEmailOtp(email: string, otp: string, _purpose: OtpPurpose): Promise<void> {
    if (this.config.get('NODE_ENV') !== 'production') {
      this.logger.debug(`[DEV] Email OTP for ${email}: ${otp}`);
    }
    // NOTE: Email/SMS integration pending — OTP logged to console in dev
  }

  /** Send OTP via SMS (integrate with your SMS service). */
  private async sendSmsOtp(mobile: string, otp: string, _purpose: OtpPurpose): Promise<void> {
    if (this.config.get('NODE_ENV') !== 'production') {
      this.logger.debug(`[DEV] SMS OTP for ${mobile}: ${otp}`);
    }
    // NOTE: Email/SMS integration pending — OTP logged to console in dev
  }
}
