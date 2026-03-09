import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';

@Injectable()
export class SoftwareOfferService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new software offer.
   */
  async create(data: {
    name: string;
    code: string;
    description?: string;
    offerType: string;
    value: number;
    applicablePlanIds?: string[];
    validFrom: Date;
    validTo: Date;
    maxRedemptions?: number;
    isActive?: boolean;
    autoApply?: boolean;
    terms?: string;
  }) {
    return this.prisma.softwareOffer.create({
      data: {
        name: data.name,
        code: data.code,
        description: data.description ?? null,
        offerType: data.offerType as any,
        value: data.value,
        applicablePlanIds: data.applicablePlanIds ?? [],
        validFrom: data.validFrom,
        validTo: data.validTo,
        maxRedemptions: data.maxRedemptions ?? 0,
        currentRedemptions: 0,
        isActive: data.isActive ?? true,
        autoApply: data.autoApply ?? false,
        terms: data.terms ?? null,
      },
    });
  }

  /**
   * Update an existing software offer.
   */
  async update(id: string, data: any) {
    const offer = await this.prisma.softwareOffer.findUnique({ where: { id } });
    if (!offer) {
      throw new NotFoundException(`Software offer ${id} not found`);
    }

    return this.prisma.softwareOffer.update({
      where: { id },
      data,
    });
  }

  /**
   * Deactivate a software offer (soft delete).
   */
  async deactivate(id: string) {
    const offer = await this.prisma.softwareOffer.findUnique({ where: { id } });
    if (!offer) {
      throw new NotFoundException(`Software offer ${id} not found`);
    }

    return this.prisma.softwareOffer.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * List all software offers with optional active filter.
   */
  async listAll(query: { isActive?: boolean }) {
    const where: any = {};

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    return this.prisma.softwareOffer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get a single software offer by ID.
   */
  async getById(id: string) {
    const offer = await this.prisma.softwareOffer.findUnique({ where: { id } });
    if (!offer) {
      throw new NotFoundException(`Software offer ${id} not found`);
    }
    return offer;
  }

  /**
   * Get applicable offers for a specific plan.
   * Finds active offers where the planId is in applicablePlanIds
   * and the current date is within the valid date range.
   */
  async getApplicable(planId: string) {
    const now = new Date();

    const offers = await this.prisma.softwareOffer.findMany({
      where: {
        isActive: true,
        validFrom: { lte: now },
        validTo: { gte: now },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Filter by applicablePlanIds (array contains planId)
    return offers.filter(
      (offer) =>
        offer.applicablePlanIds.length === 0 || offer.applicablePlanIds.includes(planId),
    );
  }

  /**
   * Redeem an offer for a tenant.
   * Increments currentRedemptions and checks maxRedemptions limit.
   */
  async redeem(offerId: string, tenantId: string) {
    const offer = await this.prisma.softwareOffer.findUnique({ where: { id: offerId } });
    if (!offer) {
      throw new NotFoundException(`Software offer ${offerId} not found`);
    }

    // Validate offer before redeeming
    const validity = await this.checkValidity(offerId);
    if (!validity.valid) {
      throw new BadRequestException(`Offer cannot be redeemed: ${validity.reason}`);
    }

    // Check max redemptions (0 means unlimited)
    if (offer.maxRedemptions > 0 && offer.currentRedemptions >= offer.maxRedemptions) {
      throw new BadRequestException('Offer has reached maximum redemptions');
    }

    // Verify tenant exists
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      throw new NotFoundException(`Tenant ${tenantId} not found`);
    }

    return this.prisma.softwareOffer.update({
      where: { id: offerId },
      data: { currentRedemptions: { increment: 1 } },
    });
  }

  /**
   * Check validity of an offer (dates, redemptions, active status).
   */
  async checkValidity(offerId: string): Promise<{ valid: boolean; reason?: string }> {
    const offer = await this.prisma.softwareOffer.findUnique({ where: { id: offerId } });
    if (!offer) {
      return { valid: false, reason: 'Offer not found' };
    }

    if (!offer.isActive) {
      return { valid: false, reason: 'Offer is inactive' };
    }

    const now = new Date();
    if (now < offer.validFrom) {
      return { valid: false, reason: 'Offer has not started yet' };
    }

    if (now > offer.validTo) {
      return { valid: false, reason: 'Offer has expired' };
    }

    if (offer.maxRedemptions > 0 && offer.currentRedemptions >= offer.maxRedemptions) {
      return { valid: false, reason: 'Maximum redemptions reached' };
    }

    return { valid: true };
  }
}
