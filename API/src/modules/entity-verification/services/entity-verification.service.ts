import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { WaApiService } from '../../whatsapp/services/wa-api.service';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EntityVerificationService {
  private readonly logger = new Logger(EntityVerificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly waApiService: WaApiService,
  ) {}

  // ── Get entity data ──────────────────────────────────────
  private async getEntity(tenantId: string, entityType: string, entityId: string) {
    switch (entityType) {
      case 'CONTACT': {
        const c = await this.prisma.contact.findFirst({
          where: { id: entityId, tenantId },
          include: {
            communications: { where: { type: 'EMAIL' }, take: 1, orderBy: { createdAt: 'desc' } },
          },
        });
        if (!c) throw new NotFoundException('Contact not found');
        const comm = c.communications[0];
        return {
          name: `${c.firstName} ${c.lastName}`.trim(),
          email: comm?.value ?? null,
          phone: null, // phone stored in communications
          verificationStatus: (c as any).entityVerificationStatus ?? 'UNVERIFIED',
        };
      }
      case 'ORGANIZATION': {
        const o = await this.prisma.organization.findFirst({ where: { id: entityId, tenantId } });
        if (!o) throw new NotFoundException('Organization not found');
        return {
          name: o.name,
          email: o.email,
          phone: o.phone,
          address: [o.address, o.city, o.state, o.pincode].filter(Boolean).join(', '),
          gstin: o.gstNumber,
          verificationStatus: (o as any).entityVerificationStatus ?? 'UNVERIFIED',
        };
      }
      case 'RAW_CONTACT': {
        const r = await this.prisma.rawContact.findFirst({
          where: { id: entityId, tenantId },
          include: {
            communications: { where: { type: 'EMAIL' }, take: 1, orderBy: { createdAt: 'desc' } },
          },
        });
        if (!r) throw new NotFoundException('Raw contact not found');
        const comm = (r as any).communications?.[0];
        return {
          name: `${r.firstName} ${r.lastName}`.trim(),
          email: comm?.value ?? null,
          phone: null,
          verificationStatus: (r as any).entityVerificationStatus ?? 'UNVERIFIED',
        };
      }
      default:
        throw new BadRequestException(`Unknown entity type: ${entityType}`);
    }
  }

  // ── Update entity verification status ───────────────────
  private async updateEntityStatus(
    tenantId: string, entityType: string, entityId: string,
    status: string, via?: string,
  ) {
    const data: any = { entityVerificationStatus: status };
    if (status === 'VERIFIED') {
      data.entityVerifiedAt = new Date();
      if (via) data.entityVerifiedVia = via;
    }
    switch (entityType) {
      case 'CONTACT':
        await this.prisma.contact.update({ where: { id: entityId }, data });
        break;
      case 'ORGANIZATION':
        await this.prisma.organization.update({ where: { id: entityId }, data });
        break;
      case 'RAW_CONTACT':
        await this.prisma.rawContact.update({ where: { id: entityId }, data });
        break;
    }
  }

  // ── Initiate verification ────────────────────────────────
  async initiateVerification(tenantId: string, userId: string, userName: string, dto: {
    entityType: string; entityId: string; mode: string; channel: string;
  }) {
    const entity = await this.getEntity(tenantId, dto.entityType, dto.entityId);

    if (entity.verificationStatus === 'VERIFIED') {
      throw new BadRequestException('Entity is already verified.');
    }

    // Validate channel has required contact info
    if (dto.channel === 'EMAIL' && !entity.email) {
      throw new BadRequestException('Entity has no email address. Add email first.');
    }
    if (['MOBILE_SMS', 'WHATSAPP'].includes(dto.channel) && !entity.phone) {
      throw new BadRequestException('Entity has no phone number. Add phone first.');
    }

    // Expire existing pending records
    await this.prisma.entityVerificationRecord.updateMany({
      where: { tenantId, entityType: dto.entityType, entityId: dto.entityId, status: 'PENDING' },
      data: { status: 'EXPIRED' },
    });

    if (dto.mode === 'OTP') {
      return this.sendOtp(tenantId, userId, userName, entity, dto);
    } else {
      return this.sendLink(tenantId, userId, userName, entity, dto);
    }
  }

  private async sendOtp(tenantId: string, userId: string, userName: string, entity: any, dto: any) {
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

    const record = await this.prisma.entityVerificationRecord.create({
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
      } as any,
    });

    await this.updateEntityStatus(tenantId, dto.entityType, dto.entityId, 'PENDING');

    // Send OTP via the chosen channel
    const sentTo = dto.channel === 'EMAIL' ? entity.email : entity.phone;
    try {
      if (dto.channel === 'EMAIL' && entity.email) {
        await this.sendEmailOtp(tenantId, entity.email, entity.name, otp);
      } else if (dto.channel === 'WHATSAPP' && entity.phone) {
        await this.sendWhatsAppOtp(tenantId, entity.phone, otp);
      }
      // MOBILE_SMS: placeholder — integrate SMS gateway when available
    } catch (err) {
      this.logger.error(`Failed to send OTP via ${dto.channel}: ${err.message}`);
    }

    const isDev = process.env.NODE_ENV !== 'production';

    return {
      recordId: record.id,
      channel: dto.channel,
      sentTo,
      expiresIn: '5 minutes',
      ...(isDev ? { devOtp: otp } : {}),
    };
  }

  private async sendLink(tenantId: string, userId: string, userName: string, entity: any, dto: any) {
    const token = crypto.randomUUID();
    const linkExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const baseUrl = process.env.APP_URL ?? 'http://localhost:3005';
    const linkUrl = `${baseUrl}/verify/${token}`;

    const record = await this.prisma.entityVerificationRecord.create({
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
      } as any,
    });

    await this.updateEntityStatus(tenantId, dto.entityType, dto.entityId, 'PENDING');

    // Send verification link via available channels
    const sentVia: string[] = [];
    try {
      if (entity.email) {
        await this.sendEmailLink(tenantId, entity.email, entity.name, linkUrl, linkExpiry);
        sentVia.push('EMAIL');
      }
    } catch (err) {
      this.logger.error(`Failed to send verification link via EMAIL: ${err.message}`);
    }
    try {
      if (entity.phone) {
        await this.sendWhatsAppLink(tenantId, entity.phone, entity.name, linkUrl);
        sentVia.push('WHATSAPP');
      }
    } catch (err) {
      this.logger.error(`Failed to send verification link via WHATSAPP: ${err.message}`);
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

  // ── Verify OTP ───────────────────────────────────────────
  async verifyOtp(tenantId: string, recordId: string, otpInput: string) {
    const record = await this.prisma.entityVerificationRecord.findFirst({
      where: { id: recordId, tenantId },
    });

    if (!record || record.status !== 'PENDING') {
      throw new BadRequestException('Invalid or already processed verification.');
    }
    if (!record.otpExpiresAt || new Date() > record.otpExpiresAt) {
      await this.prisma.entityVerificationRecord.update({
        where: { id: recordId }, data: { status: 'EXPIRED' },
      });
      throw new BadRequestException('OTP has expired. Please request a new one.');
    }
    if (record.otpAttempts >= 3) {
      await this.prisma.entityVerificationRecord.update({
        where: { id: recordId }, data: { status: 'FAILED' },
      });
      throw new BadRequestException('Too many failed attempts. Please request a new OTP.');
    }

    const otpHash = crypto.createHash('sha256').update(otpInput).digest('hex');
    const isValid = otpHash === record.otp;

    if (!isValid) {
      await this.prisma.entityVerificationRecord.update({
        where: { id: recordId }, data: { otpAttempts: { increment: 1 } },
      });
      const remaining = 3 - (record.otpAttempts + 1);
      throw new BadRequestException(`Invalid OTP. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`);
    }

    const via = `${record.channel}_OTP`;
    await this.prisma.entityVerificationRecord.update({
      where: { id: recordId }, data: { status: 'VERIFIED', verifiedAt: new Date() },
    });
    await this.updateEntityStatus(tenantId, record.entityType, record.entityId, 'VERIFIED', via);

    return { success: true, message: `${record.entityName ?? 'Entity'} verified successfully.` };
  }

  // ── Resend ───────────────────────────────────────────────
  async resend(tenantId: string, userId: string, userName: string, recordId: string) {
    const record = await this.prisma.entityVerificationRecord.findFirst({
      where: { id: recordId, tenantId },
    });
    if (!record) throw new NotFoundException('Verification record not found.');
    return this.initiateVerification(tenantId, userId, userName, {
      entityType: record.entityType,
      entityId: record.entityId,
      mode: record.mode,
      channel: record.channel,
    });
  }

  // ── History ──────────────────────────────────────────────
  async getHistory(tenantId: string, entityType: string, entityId: string) {
    return this.prisma.entityVerificationRecord.findMany({
      where: { tenantId, entityType, entityId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ── Status ───────────────────────────────────────────────
  async getStatus(tenantId: string, entityType: string, entityId: string) {
    const entity = await this.getEntity(tenantId, entityType, entityId);
    const latest = await this.prisma.entityVerificationRecord.findFirst({
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

  // ── Pending list ─────────────────────────────────────────
  async getPending(tenantId: string) {
    return this.prisma.entityVerificationRecord.findMany({
      where: { tenantId, status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ── PUBLIC: Get verification page data ──────────────────
  async getVerificationPage(token: string) {
    const record = await this.prisma.entityVerificationRecord.findUnique({
      where: { verificationToken: token },
    });
    if (!record) throw new NotFoundException('Verification link not found.');
    if (record.status === 'VERIFIED') {
      return { alreadyVerified: true, entityName: record.entityName };
    }
    if (!record.linkExpiresAt || new Date() > record.linkExpiresAt) {
      await this.prisma.entityVerificationRecord.update({
        where: { id: record.id }, data: { status: 'EXPIRED' },
      });
      return { expired: true, entityName: record.entityName };
    }

    let details: any = {};
    try {
      const entity = await this.getEntity(record.tenantId, record.entityType, record.entityId);
      details = entity;
    } catch {}

    return {
      recordId: record.id,
      entityType: record.entityType,
      entityName: record.entityName,
      details,
      expiresAt: record.linkExpiresAt,
    };
  }

  // ── PUBLIC: Confirm verification ─────────────────────────
  async confirmVerification(token: string, ipAddress: string, userAgent: string) {
    const record = await this.prisma.entityVerificationRecord.findUnique({
      where: { verificationToken: token },
    });
    if (!record || record.status !== 'PENDING') {
      throw new BadRequestException('Invalid or already processed link.');
    }
    if (!record.linkExpiresAt || new Date() > record.linkExpiresAt) {
      throw new BadRequestException('Verification link has expired.');
    }

    await this.prisma.entityVerificationRecord.update({
      where: { id: record.id },
      data: { status: 'VERIFIED', verifiedAt: new Date(), ipAddress, userAgent },
    });
    await this.updateEntityStatus(
      record.tenantId, record.entityType, record.entityId, 'VERIFIED',
      `${record.channel}_LINK`,
    );

    return { success: true, message: 'Thank you! Your details have been verified.' };
  }

  // ── PUBLIC: Reject verification ──────────────────────────
  async rejectVerification(token: string, reason: string, ipAddress: string) {
    const record = await this.prisma.entityVerificationRecord.findUnique({
      where: { verificationToken: token },
    });
    if (!record || record.status !== 'PENDING') {
      throw new BadRequestException('Invalid link.');
    }

    await this.prisma.entityVerificationRecord.update({
      where: { id: record.id },
      data: { status: 'REJECTED', rejectionReason: reason, ipAddress },
    });
    await this.updateEntityStatus(record.tenantId, record.entityType, record.entityId, 'REJECTED');

    return { success: true, message: 'Your concern has been noted. Our team will contact you.' };
  }

  // ── Auto-expire old pending verifications ────────────────
  async expireOld() {
    const { count } = await this.prisma.entityVerificationRecord.updateMany({
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

  // ══════════════════════════════════════════════════════════
  //  EMAIL & WHATSAPP DELIVERY
  // ══════════════════════════════════════════════════════════

  private async getSmtpConfig(tenantId: string) {
    // Use the first connected SMTP email account for the tenant
    const account = await this.prisma.emailAccount.findFirst({
      where: { tenantId, provider: { in: ['IMAP_SMTP', 'ORGANIZATION_SMTP'] }, status: 'ACTIVE' },
    });
    if (!account || !account.smtpHost || !account.smtpPort) return null;
    return account;
  }

  private async sendEmailOtp(tenantId: string, toEmail: string, name: string, otp: string) {
    const account = await this.getSmtpConfig(tenantId);
    if (!account) {
      this.logger.warn('No SMTP account configured — skipping email OTP delivery');
      return;
    }

    const transporter = nodemailer.createTransport({
      host: account.smtpHost,
      port: account.smtpPort,
      secure: account.smtpSecure ?? false,
      auth: account.smtpUsername ? { user: account.smtpUsername, pass: account.smtpPassword } : undefined,
    } as nodemailer.TransportOptions);

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

  private async sendEmailLink(tenantId: string, toEmail: string, name: string, linkUrl: string, expiresAt: Date) {
    const account = await this.getSmtpConfig(tenantId);
    if (!account) {
      this.logger.warn('No SMTP account configured — skipping email link delivery');
      return;
    }

    const transporter = nodemailer.createTransport({
      host: account.smtpHost,
      port: account.smtpPort,
      secure: account.smtpSecure ?? false,
      auth: account.smtpUsername ? { user: account.smtpUsername, pass: account.smtpPassword } : undefined,
    } as nodemailer.TransportOptions);

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

  private async sendWhatsAppOtp(tenantId: string, phone: string, otp: string) {
    const waba = await this.prisma.whatsAppBusinessAccount.findFirst({
      where: { tenantId },
    });
    if (!waba) {
      this.logger.warn('No WABA configured — skipping WhatsApp OTP delivery');
      return;
    }

    // Send as a text message (requires 24h window) — fall back gracefully
    try {
      await this.waApiService.sendText(
        waba.id, phone,
        `Your verification code is: *${otp}*\n\nThis code expires in 5 minutes. Do not share it with anyone.`,
      );
      this.logger.log(`OTP WhatsApp message sent to ${phone}`);
    } catch (err) {
      // If 24h window closed, log and skip — template message could be used if approved
      this.logger.warn(`WhatsApp OTP failed (may need template): ${err.message}`);
    }
  }

  private async sendWhatsAppLink(tenantId: string, phone: string, name: string, linkUrl: string) {
    const waba = await this.prisma.whatsAppBusinessAccount.findFirst({
      where: { tenantId },
    });
    if (!waba) {
      this.logger.warn('No WABA configured — skipping WhatsApp link delivery');
      return;
    }

    try {
      await this.waApiService.sendText(
        waba.id, phone,
        `Hi ${name || 'there'}, please verify your details by clicking:\n${linkUrl}\n\nThis link is valid for 24 hours.`,
      );
      this.logger.log(`Verification link WhatsApp message sent to ${phone}`);
    } catch (err) {
      this.logger.warn(`WhatsApp link send failed: ${err.message}`);
    }
  }

  // ══════════════════════════════════════════════════════════
  //  REPORT METHODS
  // ══════════════════════════════════════════════════════════

  async getReportSummary(tenantId: string, dateFrom?: string, dateTo?: string) {
    const where: any = { tenantId };
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo + 'T23:59:59.999Z');
    }

    const [total, verified, pending, expired, failed, rejected] = await Promise.all([
      this.prisma.entityVerificationRecord.count({ where }),
      this.prisma.entityVerificationRecord.count({ where: { ...where, status: 'VERIFIED' } }),
      this.prisma.entityVerificationRecord.count({ where: { ...where, status: 'PENDING' } }),
      this.prisma.entityVerificationRecord.count({ where: { ...where, status: 'EXPIRED' } }),
      this.prisma.entityVerificationRecord.count({ where: { ...where, status: 'FAILED' } }),
      this.prisma.entityVerificationRecord.count({ where: { ...where, status: 'REJECTED' } }),
    ]);

    // Channel breakdown
    const [emailCount, smsCount, whatsappCount] = await Promise.all([
      this.prisma.entityVerificationRecord.count({ where: { ...where, channel: 'EMAIL' } }),
      this.prisma.entityVerificationRecord.count({ where: { ...where, channel: 'MOBILE_SMS' } }),
      this.prisma.entityVerificationRecord.count({ where: { ...where, channel: 'WHATSAPP' } }),
    ]);

    // Mode breakdown
    const [otpCount, linkCount] = await Promise.all([
      this.prisma.entityVerificationRecord.count({ where: { ...where, mode: 'OTP' } }),
      this.prisma.entityVerificationRecord.count({ where: { ...where, mode: 'LINK' } }),
    ]);

    // Entity type breakdown
    const [contactCount, orgCount, rawContactCount] = await Promise.all([
      this.prisma.entityVerificationRecord.count({ where: { ...where, entityType: 'CONTACT' } }),
      this.prisma.entityVerificationRecord.count({ where: { ...where, entityType: 'ORGANIZATION' } }),
      this.prisma.entityVerificationRecord.count({ where: { ...where, entityType: 'RAW_CONTACT' } }),
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

  async getReportList(
    tenantId: string,
    filters: {
      status?: string; channel?: string; mode?: string; entityType?: string;
      dateFrom?: string; dateTo?: string; search?: string;
      page?: number; limit?: number;
    },
  ) {
    const where: any = { tenantId };
    if (filters.status) where.status = filters.status;
    if (filters.channel) where.channel = filters.channel;
    if (filters.mode) where.mode = filters.mode;
    if (filters.entityType) where.entityType = filters.entityType;
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo + 'T23:59:59.999Z');
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
      this.prisma.entityVerificationRecord.findMany({
        where, orderBy: { createdAt: 'desc' }, skip, take: limit,
      }),
      this.prisma.entityVerificationRecord.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getExpiredLinks(tenantId: string) {
    return this.prisma.entityVerificationRecord.findMany({
      where: {
        tenantId,
        mode: 'LINK',
        status: 'EXPIRED',
      },
      orderBy: { linkExpiresAt: 'desc' },
      take: 100,
    });
  }

  async getVerificationTrend(tenantId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const records = await this.prisma.entityVerificationRecord.findMany({
      where: { tenantId, createdAt: { gte: startDate } },
      select: { status: true, channel: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    // Group by date
    const trendMap: Record<string, { total: number; verified: number; expired: number; failed: number }> = {};
    const channelMap: Record<string, number> = { EMAIL: 0, MOBILE_SMS: 0, WHATSAPP: 0 };

    for (const r of records) {
      const dateKey = r.createdAt.toISOString().split('T')[0];
      if (!trendMap[dateKey]) trendMap[dateKey] = { total: 0, verified: 0, expired: 0, failed: 0 };
      trendMap[dateKey].total++;
      if (r.status === 'VERIFIED') trendMap[dateKey].verified++;
      if (r.status === 'EXPIRED') trendMap[dateKey].expired++;
      if (r.status === 'FAILED') trendMap[dateKey].failed++;
      if (channelMap[r.channel] !== undefined) channelMap[r.channel]++;
    }

    const trend = Object.entries(trendMap).map(([date, counts]) => ({ date, ...counts }));

    return { trend, channelBreakdown: channelMap };
  }

  async exportCsv(tenantId: string, filters?: { status?: string; dateFrom?: string; dateTo?: string }) {
    const where: any = { tenantId };
    if (filters?.status) where.status = filters.status;
    if (filters?.dateFrom || filters?.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo + 'T23:59:59.999Z');
    }

    const records = await this.prisma.entityVerificationRecord.findMany({
      where, orderBy: { createdAt: 'desc' }, take: 5000,
    });

    const header = 'Entity Name,Entity Type,Mode,Channel,Status,Sent To Email,Sent To Mobile,Verified By,Verified At,Created At\n';
    const rows = records.map(r =>
      [
        `"${r.entityName || ''}"`, r.entityType, r.mode, r.channel, r.status,
        r.sentToEmail || '', r.sentToMobile || '',
        r.verifiedByUserName || '', r.verifiedAt?.toISOString() || '',
        r.createdAt.toISOString(),
      ].join(','),
    ).join('\n');

    return header + rows;
  }
}
