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
var OtpService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const config_1 = require("@nestjs/config");
const crypto = require("crypto");
let OtpService = OtpService_1 = class OtpService {
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
        this.logger = new common_1.Logger(OtpService_1.name);
        this.OTP_LENGTH = 6;
        this.OTP_EXPIRY_MINUTES = 10;
        this.MAX_ATTEMPTS = 3;
        this.RESEND_COOLDOWN_SECONDS = 60;
    }
    async sendOtp(params) {
        const { target, targetType, purpose, userId, tenantId, ipAddress, userAgent } = params;
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
            const waitSeconds = Math.ceil((recentOtp.createdAt.getTime() + this.RESEND_COOLDOWN_SECONDS * 1000 - Date.now()) / 1000);
            throw new common_1.BadRequestException(`Please wait ${waitSeconds} seconds before requesting another OTP`);
        }
        await this.prisma.verificationOtp.updateMany({
            where: { target, purpose, status: 'OTP_PENDING' },
            data: { status: 'OTP_EXPIRED' },
        });
        const otpPlain = this.generateOtp();
        const otpHash = this.hashOtp(otpPlain);
        const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);
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
        if (targetType === 'EMAIL') {
            await this.sendEmailOtp(target, otpPlain, purpose);
        }
        else {
            await this.sendSmsOtp(target, otpPlain, purpose);
        }
        this.logger.log(`OTP sent to ${targetType}: ${this.maskTarget(target)}`);
        return {
            success: true,
            message: `OTP sent to your ${targetType.toLowerCase()}`,
            expiresAt,
        };
    }
    async verifyOtp(params) {
        const { target, purpose, otp } = params;
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
            throw new common_1.BadRequestException('OTP expired or not found. Please request a new one.');
        }
        if (otpRecord.attempts >= this.MAX_ATTEMPTS) {
            await this.prisma.verificationOtp.update({
                where: { id: otpRecord.id },
                data: { status: 'OTP_FAILED' },
            });
            throw new common_1.BadRequestException('Too many failed attempts. Please request a new OTP.');
        }
        const otpHash = this.hashOtp(otp);
        if (otpHash !== otpRecord.otp) {
            await this.prisma.verificationOtp.update({
                where: { id: otpRecord.id },
                data: { attempts: { increment: 1 } },
            });
            const remainingAttempts = this.MAX_ATTEMPTS - otpRecord.attempts - 1;
            throw new common_1.BadRequestException(`Invalid OTP. ${remainingAttempts} attempt(s) remaining.`);
        }
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
    generateOtp() {
        const digits = '0123456789';
        let otp = '';
        for (let i = 0; i < this.OTP_LENGTH; i++) {
            otp += digits[crypto.randomInt(0, digits.length)];
        }
        return otp;
    }
    hashOtp(otp) {
        return crypto.createHash('sha256').update(otp).digest('hex');
    }
    maskTarget(target) {
        if (target.includes('@')) {
            const [local, domain] = target.split('@');
            return `${local.slice(0, 2)}***@${domain}`;
        }
        return `***${target.slice(-4)}`;
    }
    async sendEmailOtp(email, otp, _purpose) {
        if (this.config.get('NODE_ENV') !== 'production') {
            this.logger.debug(`[DEV] Email OTP for ${email}: ${otp}`);
        }
    }
    async sendSmsOtp(mobile, otp, _purpose) {
        if (this.config.get('NODE_ENV') !== 'production') {
            this.logger.debug(`[DEV] SMS OTP for ${mobile}: ${otp}`);
        }
    }
};
exports.OtpService = OtpService;
exports.OtpService = OtpService = OtpService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], OtpService);
//# sourceMappingURL=otp.service.js.map