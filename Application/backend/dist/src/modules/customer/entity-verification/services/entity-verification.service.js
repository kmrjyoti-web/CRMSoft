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
var EntityVerificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityVerificationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const wa_api_service_1 = require("../../../customer/whatsapp/services/wa-api.service");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const error_utils_1 = require("../../../../common/utils/error.utils");
let EntityVerificationService = EntityVerificationService_1 = class EntityVerificationService {
    constructor(prisma, waApiService) {
        this.prisma = prisma;
        this.waApiService = waApiService;
        this.logger = new common_1.Logger(EntityVerificationService_1.name);
    }
    async getEntity(tenantId, entityType, entityId) {
        switch (entityType) {
            case 'CONTACT': {
                const c = await this.prisma.working.contact.findFirst({
                    where: { id: entityId, tenantId },
                    include: {
                        communications: { where: { type: 'EMAIL' }, take: 1, orderBy: { createdAt: 'desc' } },
                    },
                });
                if (!c)
                    throw new common_1.NotFoundException('Contact not found');
                const comm = c.communications[0];
                return {
                    name: `${c.firstName} ${c.lastName}`.trim(),
                    email: comm?.value ?? null,
                    phone: null,
                    verificationStatus: c.entityVerificationStatus ?? 'UNVERIFIED',
                };
            }
            case 'ORGANIZATION': {
                const o = await this.prisma.working.organization.findFirst({ where: { id: entityId, tenantId } });
                if (!o)
                    throw new common_1.NotFoundException('Organization not found');
                return {
                    name: o.name,
                    email: o.email,
                    phone: o.phone,
                    address: [o.address, o.city, o.state, o.pincode].filter(Boolean).join(', '),
                    gstin: o.gstNumber,
                    verificationStatus: o.entityVerificationStatus ?? 'UNVERIFIED',
                };
            }
            case 'RAW_CONTACT': {
                const r = await this.prisma.working.rawContact.findFirst({
                    where: { id: entityId, tenantId },
                    include: {
                        communications: { where: { type: 'EMAIL' }, take: 1, orderBy: { createdAt: 'desc' } },
                    },
                });
                if (!r)
                    throw new common_1.NotFoundException('Raw contact not found');
                const comm = r.communications?.[0];
                return {
                    name: `${r.firstName} ${r.lastName}`.trim(),
                    email: comm?.value ?? null,
                    phone: null,
                    verificationStatus: r.entityVerificationStatus ?? 'UNVERIFIED',
                };
            }
            default:
                throw new common_1.BadRequestException(`Unknown entity type: ${entityType}`);
        }
    }
    async updateEntityStatus(tenantId, entityType, entityId, status, via) {
        const data = { entityVerificationStatus: status };
        if (status === 'VERIFIED') {
            data.entityVerifiedAt = new Date();
            if (via)
                data.entityVerifiedVia = via;
        }
        else if (status === 'UNVERIFIED') {
            data.entityVerifiedAt = null;
            data.entityVerifiedVia = null;
        }
        switch (entityType) {
            case 'CONTACT':
                await this.prisma.working.contact.update({ where: { id: entityId }, data });
                break;
            case 'ORGANIZATION':
                await this.prisma.working.organization.update({ where: { id: entityId }, data });
                break;
            case 'RAW_CONTACT':
                await this.prisma.working.rawContact.update({ where: { id: entityId }, data });
                break;
        }
    }
    async initiateVerification(tenantId, userId, userName, dto) {
        const entity = await this.getEntity(tenantId, dto.entityType, dto.entityId);
        if (entity.verificationStatus === 'VERIFIED') {
            this.logger.log(`Re-verification requested for already verified entity ${dto.entityId}. Resetting status.`);
            await this.updateEntityStatus(tenantId, dto.entityType, dto.entityId, 'UNVERIFIED');
        }
        if (dto.channel === 'EMAIL' && !entity.email) {
            throw new common_1.BadRequestException('Entity has no email address. Add email first.');
        }
        if (['MOBILE_SMS', 'WHATSAPP'].includes(dto.channel) && !entity.phone) {
            throw new common_1.BadRequestException('Entity has no phone number. Add phone first.');
        }
        const expired = await this.prisma.working.entityVerificationRecord.updateMany({
            where: {
                tenantId,
                entityType: dto.entityType,
                entityId: dto.entityId,
                status: 'PENDING',
                createdAt: { lt: new Date(Date.now() - 10_000) },
            },
            data: { status: 'EXPIRED' },
        });
        if (expired.count > 0) {
            this.logger.log(`Expired ${expired.count} pending records for ${dto.entityType}/${dto.entityId}`);
        }
        if (dto.mode === 'OTP') {
            return this.sendOtp(tenantId, userId, userName, entity, dto);
        }
        else {
            return this.sendLink(tenantId, userId, userName, entity, dto);
        }
    }
    async sendOtp(tenantId, userId, userName, entity, dto) {
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
        const record = await this.prisma.working.entityVerificationRecord.create({
            data: {
                tenantId,
                entityType: dto.entityType,
                entityId: dto.entityId,
                entityName: entity.name,
                mode: 'OTP',
                channel: dto.channel,
                otp: otpHash,
                otpExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
                sentToEmail: dto.channel === 'EMAIL' ? entity.email : null,
                sentToMobile: ['MOBILE_SMS', 'WHATSAPP'].includes(dto.channel) ? entity.phone : null,
                verifiedByUserId: userId,
                verifiedByUserName: userName,
                verifiedByType: 'STAFF',
            },
        });
        await this.updateEntityStatus(tenantId, dto.entityType, dto.entityId, 'PENDING');
        const sentTo = dto.channel === 'EMAIL' ? entity.email : entity.phone;
        try {
            if (dto.channel === 'EMAIL' && entity.email) {
                await this.sendEmailOtp(tenantId, entity.email, entity.name, otp);
            }
            else if (dto.channel === 'WHATSAPP' && entity.phone) {
                await this.sendWhatsAppOtp(tenantId, entity.phone, otp);
            }
        }
        catch (err) {
            this.logger.error(`Failed to send OTP via ${dto.channel}: ${(0, error_utils_1.getErrorMessage)(err)}`);
        }
        const isDev = process.env.NODE_ENV !== 'production';
        return {
            recordId: record.id,
            channel: dto.channel,
            sentTo,
            expiresIn: '5 minutes',
            otpExpiresAt: record.otpExpiresAt?.toISOString(),
            ...(isDev ? { devOtp: otp } : {}),
        };
    }
    async sendLink(tenantId, userId, userName, entity, dto) {
        const token = crypto.randomUUID();
        const linkExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const baseUrl = process.env.FRONTEND_URL || process.env.APP_URL || 'http://localhost:3005';
        const linkUrl = `${baseUrl}/verify/${token}`;
        const record = await this.prisma.working.entityVerificationRecord.create({
            data: {
                tenantId,
                entityType: dto.entityType,
                entityId: dto.entityId,
                entityName: entity.name,
                mode: 'LINK',
                channel: dto.channel,
                verificationToken: token,
                linkExpiresAt: linkExpiry,
                linkUrl,
                sentToEmail: entity.email,
                sentToMobile: entity.phone,
                verifiedByUserId: userId,
                verifiedByUserName: userName,
                verifiedByType: 'SELF',
            },
        });
        await this.updateEntityStatus(tenantId, dto.entityType, dto.entityId, 'PENDING');
        const sentVia = [];
        try {
            if (entity.email) {
                await this.sendEmailLink(tenantId, entity.email, entity.name, linkUrl, linkExpiry);
                sentVia.push('EMAIL');
            }
        }
        catch (err) {
            this.logger.error(`Failed to send verification link via EMAIL: ${(0, error_utils_1.getErrorMessage)(err)}`);
        }
        try {
            if (entity.phone) {
                await this.sendWhatsAppLink(tenantId, entity.phone, entity.name, linkUrl);
                sentVia.push('WHATSAPP');
            }
        }
        catch (err) {
            this.logger.error(`Failed to send verification link via WHATSAPP: ${(0, error_utils_1.getErrorMessage)(err)}`);
        }
        return {
            recordId: record.id,
            linkUrl,
            token,
            expiresIn: '24 hours',
            expiresAt: linkExpiry,
            sentVia,
        };
    }
    async verifyOtp(tenantId, recordId, otpInput) {
        const record = await this.prisma.working.entityVerificationRecord.findFirst({
            where: { id: recordId, tenantId },
        });
        if (!record) {
            this.logger.warn(`verifyOtp: record not found � recordId=${recordId}, tenantId=${tenantId}`);
            throw new common_1.BadRequestException('Verification record not found. Please initiate verification again.');
        }
        if (record.status !== 'PENDING') {
            this.logger.warn(`verifyOtp: record status is ${record.status}, not PENDING � recordId=${recordId}`);
            throw new common_1.BadRequestException(`This verification is already ${record.status.toLowerCase()}. Please click "Send Verification" to start a new one.`);
        }
        if (!record.otpExpiresAt || new Date() > record.otpExpiresAt) {
            await this.prisma.working.entityVerificationRecord.update({
                where: { id: recordId }, data: { status: 'EXPIRED' },
            });
            throw new common_1.BadRequestException('OTP has expired. Please request a new one.');
        }
        if (record.otpAttempts >= 3) {
            await this.prisma.working.entityVerificationRecord.update({
                where: { id: recordId }, data: { status: 'FAILED' },
            });
            throw new common_1.BadRequestException('Too many failed attempts. Please request a new OTP.');
        }
        const otpHash = crypto.createHash('sha256').update(otpInput).digest('hex');
        const isValid = otpHash === record.otp;
        if (!isValid) {
            await this.prisma.working.entityVerificationRecord.update({
                where: { id: recordId }, data: { otpAttempts: { increment: 1 } },
            });
            const remaining = 3 - (record.otpAttempts + 1);
            throw new common_1.BadRequestException(`Invalid OTP. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`);
        }
        const via = `${record.channel}_OTP`;
        await this.prisma.working.entityVerificationRecord.update({
            where: { id: recordId }, data: { status: 'VERIFIED', verifiedAt: new Date() },
        });
        await this.updateEntityStatus(tenantId, record.entityType, record.entityId, 'VERIFIED', via);
        return { success: true, message: `${record.entityName ?? 'Entity'} verified successfully.` };
    }
    async resetVerification(tenantId, entityType, entityId) {
        const { count } = await this.prisma.working.entityVerificationRecord.deleteMany({
            where: { tenantId, entityType, entityId },
        });
        await this.updateEntityStatus(tenantId, entityType, entityId, 'UNVERIFIED');
        return { success: true, deletedRecords: count, message: 'Verification reset. You can now verify again.' };
    }
    async resend(tenantId, userId, userName, recordId) {
        const record = await this.prisma.working.entityVerificationRecord.findFirst({
            where: { id: recordId, tenantId },
        });
        if (!record)
            throw new common_1.NotFoundException('Verification record not found.');
        return this.initiateVerification(tenantId, userId, userName, {
            entityType: record.entityType,
            entityId: record.entityId,
            mode: record.mode,
            channel: record.channel,
        });
    }
    async getHistory(tenantId, entityType, entityId) {
        return this.prisma.working.entityVerificationRecord.findMany({
            where: { tenantId, entityType, entityId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getStatus(tenantId, entityType, entityId) {
        const entity = await this.getEntity(tenantId, entityType, entityId);
        const latest = await this.prisma.working.entityVerificationRecord.findFirst({
            where: { tenantId, entityType, entityId },
            orderBy: { createdAt: 'desc' },
        });
        return {
            entityType,
            entityId,
            verificationStatus: entity.verificationStatus,
            latestRecord: latest ?? null,
        };
    }
    async getPending(tenantId) {
        return this.prisma.working.entityVerificationRecord.findMany({
            where: { tenantId, status: 'PENDING' },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getVerificationPage(token) {
        const record = await this.prisma.working.entityVerificationRecord.findUnique({
            where: { verificationToken: token },
        });
        if (!record)
            throw new common_1.NotFoundException('Verification link not found.');
        if (record.status === 'VERIFIED') {
            return { alreadyVerified: true, entityName: record.entityName };
        }
        if (!record.linkExpiresAt || new Date() > record.linkExpiresAt) {
            await this.prisma.working.entityVerificationRecord.update({
                where: { id: record.id }, data: { status: 'EXPIRED' },
            });
            return { expired: true, entityName: record.entityName };
        }
        let details = {};
        try {
            const entity = await this.getEntity(record.tenantId, record.entityType, record.entityId);
            details = entity;
        }
        catch { }
        return {
            recordId: record.id,
            entityType: record.entityType,
            entityName: record.entityName,
            details,
            expiresAt: record.linkExpiresAt,
        };
    }
    async confirmVerification(token, ipAddress, userAgent) {
        const record = await this.prisma.working.entityVerificationRecord.findUnique({
            where: { verificationToken: token },
        });
        if (!record || record.status !== 'PENDING') {
            throw new common_1.BadRequestException('Invalid or already processed link.');
        }
        if (!record.linkExpiresAt || new Date() > record.linkExpiresAt) {
            throw new common_1.BadRequestException('Verification link has expired.');
        }
        await this.prisma.working.entityVerificationRecord.update({
            where: { id: record.id },
            data: { status: 'VERIFIED', verifiedAt: new Date(), ipAddress, userAgent },
        });
        await this.updateEntityStatus(record.tenantId, record.entityType, record.entityId, 'VERIFIED', `${record.channel}_LINK`);
        return { success: true, message: 'Thank you! Your details have been verified.' };
    }
    async rejectVerification(token, reason, ipAddress) {
        const record = await this.prisma.working.entityVerificationRecord.findUnique({
            where: { verificationToken: token },
        });
        if (!record || record.status !== 'PENDING') {
            throw new common_1.BadRequestException('Invalid link.');
        }
        await this.prisma.working.entityVerificationRecord.update({
            where: { id: record.id },
            data: { status: 'REJECTED', rejectionReason: reason, ipAddress },
        });
        await this.updateEntityStatus(record.tenantId, record.entityType, record.entityId, 'REJECTED');
        return { success: true, message: 'Your concern has been noted. Our team will contact you.' };
    }
    async expireOld() {
        const { count } = await this.prisma.working.entityVerificationRecord.updateMany({
            where: {
                status: 'PENDING',
                OR: [
                    { otpExpiresAt: { lt: new Date() } },
                    { linkExpiresAt: { lt: new Date() } },
                ],
            },
            data: { status: 'EXPIRED' },
        });
        return { expired: count };
    }
    async getSmtpConfig(tenantId) {
        const account = await this.prisma.working.emailAccount.findFirst({
            where: { tenantId, provider: { in: ['IMAP_SMTP', 'ORGANIZATION_SMTP'] }, status: 'ACTIVE' },
        });
        if (!account || !account.smtpHost || !account.smtpPort)
            return null;
        return account;
    }
    async sendEmailOtp(tenantId, toEmail, name, otp) {
        const account = await this.getSmtpConfig(tenantId);
        if (!account) {
            this.logger.warn('No SMTP account configured � skipping email OTP delivery');
            return;
        }
        const transporter = nodemailer.createTransport({
            host: account.smtpHost,
            port: account.smtpPort,
            secure: account.smtpSecure ?? false,
            auth: account.smtpUsername ? { user: account.smtpUsername, pass: account.smtpPassword } : undefined,
        });
        await transporter.sendMail({
            from: `"${account.displayName || 'CRM Verification'}" <${account.emailAddress}>`,
            to: toEmail,
            subject: 'Your Verification Code',
            html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;">
          <h2 style="color:#1a73e8;margin-bottom:8px;">Verification Code</h2>
          <p>Hi ${name || 'there'},</p>
          <p>Your verification code is:</p>
          <div style="font-size:32px;font-weight:bold;letter-spacing:8px;text-align:center;
                      padding:16px;background:#f5f5f5;border-radius:8px;margin:16px 0;">
            ${otp}
          </div>
          <p style="color:#666;font-size:14px;">This code expires in <strong>5 minutes</strong>. Do not share it with anyone.</p>
        </div>
      `,
        });
        this.logger.log(`OTP email sent to ${toEmail}`);
    }
    async sendEmailLink(tenantId, toEmail, name, linkUrl, expiresAt) {
        const account = await this.getSmtpConfig(tenantId);
        if (!account) {
            this.logger.warn('No SMTP account configured � skipping email link delivery');
            return;
        }
        const transporter = nodemailer.createTransport({
            host: account.smtpHost,
            port: account.smtpPort,
            secure: account.smtpSecure ?? false,
            auth: account.smtpUsername ? { user: account.smtpUsername, pass: account.smtpPassword } : undefined,
        });
        await transporter.sendMail({
            from: `"${account.displayName || 'CRM Verification'}" <${account.emailAddress}>`,
            to: toEmail,
            subject: 'Please Verify Your Details',
            html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;">
          <h2 style="color:#1a73e8;margin-bottom:8px;">Verification Request</h2>
          <p>Hi ${name || 'there'},</p>
          <p>We need to verify your contact details. Please click the button below to review and confirm:</p>
          <div style="text-align:center;margin:24px 0;">
            <a href="${linkUrl}" style="display:inline-block;padding:12px 32px;background:#1a73e8;
               color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">
              Verify My Details
            </a>
          </div>
          <p style="color:#666;font-size:14px;">This link expires on <strong>${expiresAt.toLocaleString()}</strong>.</p>
          <p style="color:#999;font-size:12px;">If you didn't expect this, please ignore this email.</p>
        </div>
      `,
        });
        this.logger.log(`Verification link email sent to ${toEmail}`);
    }
    async sendWhatsAppOtp(tenantId, phone, otp) {
        const waba = await this.prisma.working.whatsAppBusinessAccount.findFirst({
            where: { tenantId },
        });
        if (!waba) {
            this.logger.warn('No WABA configured � skipping WhatsApp OTP delivery');
            return;
        }
        try {
            await this.waApiService.sendText(waba.id, phone, `Your verification code is: *${otp}*\n\nThis code expires in 5 minutes. Do not share it with anyone.`);
            this.logger.log(`OTP WhatsApp message sent to ${phone}`);
        }
        catch (err) {
            this.logger.warn(`WhatsApp OTP failed (may need template): ${(0, error_utils_1.getErrorMessage)(err)}`);
        }
    }
    async sendWhatsAppLink(tenantId, phone, name, linkUrl) {
        const waba = await this.prisma.working.whatsAppBusinessAccount.findFirst({
            where: { tenantId },
        });
        if (!waba) {
            this.logger.warn('No WABA configured � skipping WhatsApp link delivery');
            return;
        }
        try {
            await this.waApiService.sendText(waba.id, phone, `Hi ${name || 'there'}, please verify your details by clicking:\n${linkUrl}\n\nThis link is valid for 24 hours.`);
            this.logger.log(`Verification link WhatsApp message sent to ${phone}`);
        }
        catch (err) {
            this.logger.warn(`WhatsApp link send failed: ${(0, error_utils_1.getErrorMessage)(err)}`);
        }
    }
    async getReportSummary(tenantId, dateFrom, dateTo) {
        const where = { tenantId };
        if (dateFrom || dateTo) {
            where.createdAt = {};
            if (dateFrom)
                where.createdAt.gte = new Date(dateFrom);
            if (dateTo)
                where.createdAt.lte = new Date(dateTo + 'T23:59:59.999Z');
        }
        const [total, verified, pending, expired, failed, rejected] = await Promise.all([
            this.prisma.working.entityVerificationRecord.count({ where }),
            this.prisma.working.entityVerificationRecord.count({ where: { ...where, status: 'VERIFIED' } }),
            this.prisma.working.entityVerificationRecord.count({ where: { ...where, status: 'PENDING' } }),
            this.prisma.working.entityVerificationRecord.count({ where: { ...where, status: 'EXPIRED' } }),
            this.prisma.working.entityVerificationRecord.count({ where: { ...where, status: 'FAILED' } }),
            this.prisma.working.entityVerificationRecord.count({ where: { ...where, status: 'REJECTED' } }),
        ]);
        const [emailCount, smsCount, whatsappCount] = await Promise.all([
            this.prisma.working.entityVerificationRecord.count({ where: { ...where, channel: 'EMAIL' } }),
            this.prisma.working.entityVerificationRecord.count({ where: { ...where, channel: 'MOBILE_SMS' } }),
            this.prisma.working.entityVerificationRecord.count({ where: { ...where, channel: 'WHATSAPP' } }),
        ]);
        const [otpCount, linkCount] = await Promise.all([
            this.prisma.working.entityVerificationRecord.count({ where: { ...where, mode: 'OTP' } }),
            this.prisma.working.entityVerificationRecord.count({ where: { ...where, mode: 'LINK' } }),
        ]);
        const [contactCount, orgCount, rawContactCount] = await Promise.all([
            this.prisma.working.entityVerificationRecord.count({ where: { ...where, entityType: 'CONTACT' } }),
            this.prisma.working.entityVerificationRecord.count({ where: { ...where, entityType: 'ORGANIZATION' } }),
            this.prisma.working.entityVerificationRecord.count({ where: { ...where, entityType: 'RAW_CONTACT' } }),
        ]);
        const verificationRate = total > 0 ? Math.round((verified / total) * 100) : 0;
        return {
            total,
            verified,
            pending,
            expired,
            failed,
            rejected,
            verificationRate,
            byChannel: { EMAIL: emailCount, MOBILE_SMS: smsCount, WHATSAPP: whatsappCount },
            byMode: { OTP: otpCount, LINK: linkCount },
            byEntityType: { CONTACT: contactCount, ORGANIZATION: orgCount, RAW_CONTACT: rawContactCount },
        };
    }
    async getReportList(tenantId, filters) {
        const where = { tenantId };
        if (filters.status)
            where.status = filters.status;
        if (filters.channel)
            where.channel = filters.channel;
        if (filters.mode)
            where.mode = filters.mode;
        if (filters.entityType)
            where.entityType = filters.entityType;
        if (filters.dateFrom || filters.dateTo) {
            where.createdAt = {};
            if (filters.dateFrom)
                where.createdAt.gte = new Date(filters.dateFrom);
            if (filters.dateTo)
                where.createdAt.lte = new Date(filters.dateTo + 'T23:59:59.999Z');
        }
        if (filters.search) {
            where.OR = [
                { entityName: { contains: filters.search, mode: 'insensitive' } },
                { sentToEmail: { contains: filters.search, mode: 'insensitive' } },
                { sentToMobile: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 20;
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.working.entityVerificationRecord.findMany({
                where, orderBy: { createdAt: 'desc' }, skip, take: limit,
            }),
            this.prisma.working.entityVerificationRecord.count({ where }),
        ]);
        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getExpiredLinks(tenantId) {
        return this.prisma.working.entityVerificationRecord.findMany({
            where: {
                tenantId,
                mode: 'LINK',
                status: 'EXPIRED',
            },
            orderBy: { linkExpiresAt: 'desc' },
            take: 100,
        });
    }
    async getVerificationTrend(tenantId, days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const records = await this.prisma.working.entityVerificationRecord.findMany({
            where: { tenantId, createdAt: { gte: startDate } },
            select: { status: true, channel: true, createdAt: true },
            orderBy: { createdAt: 'asc' },
        });
        const trendMap = {};
        const channelMap = { EMAIL: 0, MOBILE_SMS: 0, WHATSAPP: 0 };
        for (const r of records) {
            const dateKey = r.createdAt.toISOString().split('T')[0];
            if (!trendMap[dateKey])
                trendMap[dateKey] = { total: 0, verified: 0, expired: 0, failed: 0 };
            trendMap[dateKey].total++;
            if (r.status === 'VERIFIED')
                trendMap[dateKey].verified++;
            if (r.status === 'EXPIRED')
                trendMap[dateKey].expired++;
            if (r.status === 'FAILED')
                trendMap[dateKey].failed++;
            if (channelMap[r.channel] !== undefined)
                channelMap[r.channel]++;
        }
        const trend = Object.entries(trendMap).map(([date, counts]) => ({ date, ...counts }));
        return { trend, channelBreakdown: channelMap };
    }
    async exportCsv(tenantId, filters) {
        const where = { tenantId };
        if (filters?.status)
            where.status = filters.status;
        if (filters?.dateFrom || filters?.dateTo) {
            where.createdAt = {};
            if (filters.dateFrom)
                where.createdAt.gte = new Date(filters.dateFrom);
            if (filters.dateTo)
                where.createdAt.lte = new Date(filters.dateTo + 'T23:59:59.999Z');
        }
        const records = await this.prisma.working.entityVerificationRecord.findMany({
            where, orderBy: { createdAt: 'desc' }, take: 5000,
        });
        const header = 'Entity Name,Entity Type,Mode,Channel,Status,Sent To Email,Sent To Mobile,Verified By,Verified At,Created At\n';
        const rows = records.map(r => [
            `"${r.entityName || ''}"`, r.entityType, r.mode, r.channel, r.status,
            r.sentToEmail || '', r.sentToMobile || '',
            r.verifiedByUserName || '', r.verifiedAt?.toISOString() || '',
            r.createdAt.toISOString(),
        ].join(',')).join('\n');
        return header + rows;
    }
};
exports.EntityVerificationService = EntityVerificationService;
exports.EntityVerificationService = EntityVerificationService = EntityVerificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        wa_api_service_1.WaApiService])
], EntityVerificationService);
//# sourceMappingURL=entity-verification.service.js.map