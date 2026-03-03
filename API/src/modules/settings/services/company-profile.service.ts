import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { CompanyProfile } from '@prisma/client';
import { AppError } from '../../../common/errors/app-error';

@Injectable()
export class CompanyProfileService {
  private readonly logger = new Logger(CompanyProfileService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Get full company profile. */
  async get(tenantId: string): Promise<CompanyProfile> {
    const profile = await this.prisma.companyProfile.findUnique({ where: { tenantId } });
    if (!profile) throw AppError.from('TENANT_NOT_FOUND');
    return profile;
  }

  /** Update company profile. */
  async update(tenantId: string, data: Partial<CompanyProfile>, userId?: string): Promise<CompanyProfile> {
    return this.prisma.companyProfile.upsert({
      where: { tenantId },
      update: { ...data, updatedById: userId },
      create: { tenantId, companyName: (data as any).companyName ?? 'My Company', ...data } as any,
    });
  }

  /** Get public-facing company info (for quotation/invoice headers). */
  async getPublic(tenantId: string): Promise<Partial<CompanyProfile>> {
    const profile = await this.prisma.companyProfile.findUnique({ where: { tenantId } });
    if (!profile) return {};
    return {
      companyName: profile.companyName,
      legalName: profile.legalName,
      phone: profile.phone,
      email: profile.email,
      website: profile.website,
      addressLine1: profile.addressLine1,
      addressLine2: profile.addressLine2,
      city: profile.city,
      state: profile.state,
      country: profile.country,
      pincode: profile.pincode,
      gstNumber: profile.gstNumber,
      panNumber: profile.panNumber,
      bankName: profile.bankName,
      bankBranch: profile.bankBranch,
      accountNumber: profile.accountNumber,
      ifscCode: profile.ifscCode,
      accountType: profile.accountType,
      upiId: profile.upiId,
      linkedinUrl: profile.linkedinUrl,
      facebookUrl: profile.facebookUrl,
      twitterUrl: profile.twitterUrl,
      instagramUrl: profile.instagramUrl,
      youtubeUrl: profile.youtubeUrl,
    };
  }
}
