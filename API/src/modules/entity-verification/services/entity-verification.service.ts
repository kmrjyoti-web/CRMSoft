import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class EntityVerificationService {
  constructor(private readonly prisma: PrismaService) {}

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

    // In production: send via EmailService / SMS / WhatsApp
    // For now, return OTP in dev mode
    const isDev = process.env.NODE_ENV !== 'production';

    return {
      recordId: record.id,
      channel: dto.channel,
      sentTo: dto.channel === 'EMAIL' ? entity.email : entity.phone,
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

    // In production: send via EmailService / WhatsAppService

    return {
      recordId: record.id,
      linkUrl,
      token,
      expiresIn: '24 hours',
      expiresAt: linkExpiry,
      sentVia: [entity.email ? 'EMAIL' : null, entity.phone ? 'WHATSAPP' : null].filter(Boolean),
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
}
