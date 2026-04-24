import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { CompanyProfile } from '@prisma/working-client';
import { AppError } from '../../../../../common/errors/app-error';

@Injectable()
export class CompanyProfileService {
  private readonly logger = new Logger(CompanyProfileService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Get full company profile. Auto-creates with defaults if none exists. */
  async get(tenantId: string): Promise<CompanyProfile> {
    const profile = await this.prisma.companyProfile.findUnique({ where: { tenantId } });
    if (profile) return profile;
    // Auto-create with Indian defaults on first access
    return this.prisma.companyProfile.create({
      data: {
        tenantId,
        companyName: 'My Company',
        country: 'India',
        countryCode: 'IN',
        currencyCode: 'INR',
        currencySymbol: '?',
        numberFormat: 'INDIAN',
        financialYearStart: 4,
        financialYearEnd: 3,
        timezone: 'Asia/Kolkata',
        locale: 'en-IN',
        dateFormat: 'DD/MM/YYYY',
        accountingMethod: 'ACCRUAL',
        inventoryMethod: 'FIFO',
        workingPattern: 'STANDARD',
        workingDays: ['MON','TUE','WED','THU','FRI','SAT'],
        weekOff: ['SUN'],
      } as any,
    });
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
