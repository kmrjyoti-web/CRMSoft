import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { WaApiService } from '../../../customer/whatsapp/services/wa-api.service';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import { getErrorMessage } from '@/common/utils/error.utils';

@Injectable()
export class EntityVerificationService {
  private readonly logger = new Logger(EntityVerificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly waApiService: WaApiService,
  ) {}

  // -- Get entity data --------------------------------------
  private async getEntity(tenantId: string, entityType: string, entityId: string) {
    switch (entityType) {
      case 'CONTACT': {
        const c = await this.prisma.working.contact.findFirst({
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
        const o = await this.prisma.working.organization.findFirst({ where: { id: entityId, tenantId } });
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
        const r = await this.prisma.working.rawContact.findFirst({
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

  // -- Update entity verification status -------------------
  private async updateEntityStatus(
    tenantId: string, entityType: string, entityId: string,
    status: string, via?: string,
  ) {
    const data: any = { entityVerificationStatus: status };
    if (status === 'VERIFIED') {
      data.entityVerifiedAt = new Date();
      if (via) data.entityVerifiedVia = via;
    } else if (status === 'UNVERIFIED') {
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

  // -- Initiate verification --------------------------------
  async initiateVerification(tenantId: string, userId: string, userName: string, dto: {
    entityType: string; entityId: string; mode: string; channel: string;
  }) {
    const entity = await this.getEntity(tenantId, dto.entityType, dto.entityId);

    if (entity.verificationStatus === 'VERIFIED') {
      this.logger.log(`Re-verification requested for already verified entity ${dto.entityId}. Resetting status.`);
      await this.updateEntityStatus(tenantId, dto.entityType, dto.entityId, 'UNVERIFIED');
    }

    // Validate channel has required contact info
    if (dto.channel === 'EMAIL' && !entity.email) {
      throw new BadRequestException('Entity has no email address. Add email first.');
    }
    if (['MOBILE_SMS', 'WHATSAPP'].includes(dto.channel) && !entity.phone) {
      throw new BadRequestException('Entity has no phone number. Add phone first.');
    }

    // Expire existing pending records (skip records created in the last 10s to prevent double-click race)
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
    } else {
      return this.sendLink(tenantId, userId, userName, entity, dto);
    }
  }

  private async sendOtp(tenantId: string, userId: string, userName: string, entity: any, dto: any) {
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
