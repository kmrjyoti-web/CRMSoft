"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var VerificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const otp_service_1 = require("./otp.service");
let VerificationService = VerificationService_1 = class VerificationService {
    constructor(prisma, otpService) {
        this.prisma = prisma;
        this.otpService = otpService;
        this.logger = new common_1.Logger(VerificationService_1.name);
    }
    async sendEmailVerification(userId, ipAddress, userAgent) {
        const user = await this.getUser(userId);
        if (user.emailVerified) {
            throw new common_1.BadRequestException('Email is already verified');
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
    async verifyEmail(userId, otp) {
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
    async sendMobileVerification(userId, ipAddress, userAgent) {
        const user = await this.getUser(userId);
        if (!user.phone) {
            throw new common_1.BadRequestException('Mobile number not provided');
        }
        if (user.mobileVerified) {
            throw new common_1.BadRequestException('Mobile is already verified');
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
    async verifyMobile(userId, otp) {
        const user = await this.getUser(userId);
        if (!user.phone) {
            throw new common_1.BadRequestException('Mobile number not provided');
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
    async submitGstForVerification(userId, gstNumber, companyName, businessType) {
        const user = await this.getUser(userId);
        const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
        if (!gstRegex.test(gstNumber)) {
            throw new common_1.BadRequestException('Invalid GST number format');
        }
        const existingUser = await this.prisma.user.findFirst({
            where: {
                gstNumber,
                id: { not: userId },
                gstVerified: true,
            },
        });
        if (existingUser) {
            throw new common_1.BadRequestException('This GST number is already registered with another account');
        }
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
    async verifyGstViaApi(userId, gstNumber) {
        const user = await this.getUser(userId);
        try {
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
            return { success: false };
        }
        catch (error) {
            this.logger.error(`GST verification failed for ${gstNumber}`, error);
            return { success: false };
        }
    }
    async approveGstManually(userId, approvedById, notes) {
        const user = await this.getUser(userId);
        if (!user.gstNumber) {
            throw new common_1.BadRequestException('User has not submitted GST number');
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
    async getVerificationStatus(userId) {
        const user = await this.getUser(userId);
        const canSeeB2BPricing = user.registrationType === 'BUSINESS' &&
            user.gstVerified === true;
        const allowedActions = this.getAllowedActions(user.verificationStatus, canSeeB2BPricing);
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
    async canPerformAction(userId, action) {
        const status = await this.getVerificationStatus(userId);
        return status.allowedActions.includes(action);
    }
    async requireVerification(userId, action) {
        const canPerform = await this.canPerformAction(userId, action);
        if (!canPerform) {
            const status = await this.getVerificationStatus(userId);
            if (status.verificationStatus === 'UNVERIFIED') {
                throw new common_1.BadRequestException({
                    errorCode: 'VERIFICATION_REQUIRED',
                    message: 'Please verify your email and mobile to perform this action',
                    requiredVerification: ['email', 'mobile'],
                });
            }
            const missing = [];
            if (!status.emailVerified)
                missing.push('email');
            if (!status.mobileVerified)
                missing.push('mobile');
            throw new common_1.BadRequestException({
                errorCode: 'VERIFICATION_INCOMPLETE',
                message: `Please verify your ${missing.join(' and ')} to perform this action`,
                requiredVerification: missing,
            });
        }
    }
    async getUser(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    calculateVerificationStatus(emailVerified, mobileVerified) {
        if (emailVerified && mobileVerified)
            return 'FULLY_VERIFIED';
        if (emailVerified || mobileVerified)
            return 'PARTIALLY_VERIFIED';
        return 'UNVERIFIED';
    }
    getAllowedActions(status, canSeeB2BPricing) {
        const actions = ['browse', 'view_b2c_price'];
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
};
exports.VerificationService = VerificationService;
exports.VerificationService = VerificationService = VerificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        otp_service_1.OtpService])
], VerificationService);
//# sourceMappingURL=verification.service.js.map