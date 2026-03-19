import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { OtpService } from './otp.service';
import { VerificationStatus, RegistrationType } from '@prisma/client';

export interface UserVerificationInfo {
  userId: string;
  email: string;
  phone: string;
  verificationStatus: VerificationStatus;
  emailVerified: boolean;
  mobileVerified: boolean;
  registrationType: RegistrationType;
  gstVerified: boolean;
  canSeeB2BPricing: boolean;
  allowedActions: string[];
}

@Injectable()
export class VerificationService {
  private readonly logger = new Logger(VerificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly otpService: OtpService,
  ) {}

  // ═══════════════════════════════════════════════════════
  // EMAIL VERIFICATION
  // ═══════════════════════════════════════════════════════

  async sendEmailVerification(userId: string, ipAddress?: string, userAgent?: string) {
    const user = await this.getUser(userId);

    if (user.emailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    return this.otpService.sendOtp({
      target: user.email,
      targetType: 'EMAIL',
      purpose: 'EMAIL_VERIFICATION',
      userId,
      tenantId: user.tenantId || undefined,
      ipAddress,
      userAgent,
    });
  }

  async verifyEmail(userId: string, otp: string) {
    const user = await this.getUser(userId);

    await this.otpService.verifyOtp({
      target: user.email,
      targetType: 'EMAIL',
      purpose: 'EMAIL_VERIFICATION',
      otp,
      userId,
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date(),
        verificationStatus: this.calculateVerificationStatus(true, user.mobileVerified),
      },
    });

    this.logger.log(`Email verified for user ${userId}`);
    return { success: true, message: 'Email verified successfully' };
  }

  // ═══════════════════════════════════════════════════════
  // MOBILE VERIFICATION
  // ═══════════════════════════════════════════════════════

  async sendMobileVerification(userId: string, ipAddress?: string, userAgent?: string) {
    const user = await this.getUser(userId);

    if (!user.phone) {
      throw new BadRequestException('Mobile number not provided');
    }

    if (user.mobileVerified) {
      throw new BadRequestException('Mobile is already verified');
    }

    return this.otpService.sendOtp({
      target: user.phone,
      targetType: 'MOBILE',
      purpose: 'MOBILE_VERIFICATION',
      userId,
      tenantId: user.tenantId || undefined,
      ipAddress,
      userAgent,
    });
  }

  async verifyMobile(userId: string, otp: string) {
    const user = await this.getUser(userId);

    if (!user.phone) {
      throw new BadRequestException('Mobile number not provided');
    }

    await this.otpService.verifyOtp({
      target: user.phone,
      targetType: 'MOBILE',
      purpose: 'MOBILE_VERIFICATION',
      otp,
      userId,
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        mobileVerified: true,
        mobileVerifiedAt: new Date(),
        verificationStatus: this.calculateVerificationStatus(user.emailVerified, true),
      },
    });

    this.logger.log(`Mobile verified for user ${userId}`);
    return { success: true, message: 'Mobile verified successfully' };
  }

  // ═══════════════════════════════════════════════════════
  // GST VERIFICATION (For B2B Pricing)
  // ═══════════════════════════════════════════════════════

  async submitGstForVerification(
    userId: string,
    gstNumber: string,
    companyName: string,
    businessType?: string,
  ) {
    const user = await this.getUser(userId);

    // Validate GST format (15 chars: 2 state + 10 PAN + 1 entity + 1 check + 1 default)
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstRegex.test(gstNumber)) {
      throw new BadRequestException('Invalid GST number format');
    }

    // Check if GST already used by another user
    const existingUser = await this.prisma.user.findFirst({
      where: {
        gstNumber,
        id: { not: userId },
        gstVerified: true,
      },
    });

    if (existingUser) {
      throw new BadRequestException('This GST number is already registered with another account');
    }

    // Update user with GST details (pending verification)
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        gstNumber,
        companyName,
        businessType,
        registrationType: 'BUSINESS',
        gstVerified: false,
      },
    });

    // Try API verification (or queue for manual verification)
    const verificationResult = await this.verifyGstViaApi(userId, gstNumber);

    if (verificationResult.success) {
      return {
        success: true,
        message: 'GST verified successfully. You now have access to B2B pricing.',
        verificationMethod: 'API',
      };
    }

    return {
      success: true,
      message: 'GST submitted for manual verification. You will be notified once verified.',
      verificationMethod: 'MANUAL_PENDING',
    };
  }

  private async verifyGstViaApi(userId: string, gstNumber: string): Promise<{ success: boolean }> {
    const user = await this.getUser(userId);

    try {
      // Auto-approve in development
      if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
        await this.prisma.user.update({
          where: { id: userId },
          data: {
            gstVerified: true,
            gstVerifiedAt: new Date(),
            gstVerificationMethod: 'DEV_AUTO',
          },
        });

        await this.prisma.gstVerificationLog.create({
          data: {
            tenantId: user.tenantId,
            userId,
            gstNumber,
            verificationMethod: 'DEV_AUTO',
            isValid: true,
            businessName: user.companyName,
          },
        });

        return { success: true };
      }

      // Production: Call GST API
      // const response = await this.gstApiService.verify(gstNumber);
      return { success: false };
    } catch (error) {
      this.logger.error(`GST verification failed for ${gstNumber}`, error);
      return { success: false };
    }
  }

  async approveGstManually(userId: string, approvedById: string, notes?: string) {
    const user = await this.getUser(userId);

    if (!user.gstNumber) {
      throw new BadRequestException('User has not submitted GST number');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        gstVerified: true,
        gstVerifiedAt: new Date(),
        gstVerificationMethod: 'MANUAL',
      },
    });

    await this.prisma.gstVerificationLog.create({
      data: {
        tenantId: user.tenantId,
        userId,
        gstNumber: user.gstNumber,
        verificationMethod: 'MANUAL',
        isValid: true,
        businessName: user.companyName,
        approvedBy: approvedById,
        approvalNotes: notes,
      },
    });

    this.logger.log(`GST manually approved for user ${userId} by ${approvedById}`);
    return { success: true, message: 'GST verified successfully' };
  }

  // ═══════════════════════════════════════════════════════
  // GET VERIFICATION STATUS
  // ═══════════════════════════════════════════════════════

  async getVerificationStatus(userId: string): Promise<UserVerificationInfo> {
    const user = await this.getUser(userId);

    const canSeeB2BPricing =
      user.registrationType === 'BUSINESS' &&
      user.gstVerified === true;

    const allowedActions = this.getAllowedActions(
      user.verificationStatus,
      canSeeB2BPricing,
    );

    return {
      userId: user.id,
      email: user.email,
      phone: user.phone || '',
      verificationStatus: user.verificationStatus,
      emailVerified: user.emailVerified,
      mobileVerified: user.mobileVerified,
      registrationType: user.registrationType,
      gstVerified: user.gstVerified,
      canSeeB2BPricing,
      allowedActions,
    };
  }

  // ═══════════════════════════════════════════════════════
  // CHECK PERMISSIONS
  // ═══════════════════════════════════════════════════════

  async canPerformAction(userId: string, action: string): Promise<boolean> {
    const status = await this.getVerificationStatus(userId);
    return status.allowedActions.includes(action);
  }

  async requireVerification(userId: string, action: string): Promise<void> {
    const canPerform = await this.canPerformAction(userId, action);

    if (!canPerform) {
      const status = await this.getVerificationStatus(userId);

      if (status.verificationStatus === 'UNVERIFIED') {
        throw new BadRequestException({
          errorCode: 'VERIFICATION_REQUIRED',
          message: 'Please verify your email and mobile to perform this action',
          requiredVerification: ['email', 'mobile'],
        });
      }

      const missing: string[] = [];
      if (!status.emailVerified) missing.push('email');
      if (!status.mobileVerified) missing.push('mobile');

      throw new BadRequestException({
        errorCode: 'VERIFICATION_INCOMPLETE',
        message: `Please verify your ${missing.join(' and ')} to perform this action`,
        requiredVerification: missing,
      });
    }
  }

  // ═══════════════════════════════════════════════════════
  // PRIVATE HELPERS
  // ═══════════════════════════════════════════════════════

  private async getUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  private calculateVerificationStatus(
    emailVerified: boolean,
    mobileVerified: boolean,
  ): VerificationStatus {
    if (emailVerified && mobileVerified) return 'FULLY_VERIFIED';
    if (emailVerified || mobileVerified) return 'PARTIALLY_VERIFIED';
    return 'UNVERIFIED';
  }

  private getAllowedActions(
    status: VerificationStatus,
    canSeeB2BPricing: boolean,
  ): string[] {
    const actions: string[] = ['browse', 'view_b2c_price'];

    if (status === 'PARTIALLY_VERIFIED' || status === 'FULLY_VERIFIED') {
      actions.push('like', 'comment', 'save', 'follow');
    }

    if (status === 'FULLY_VERIFIED') {
      actions.push('enquiry', 'order', 'chat', 'share_contact');
    }

    if (canSeeB2BPricing) {
      actions.push('view_b2b_price');
    }

    return actions;
  }
}
