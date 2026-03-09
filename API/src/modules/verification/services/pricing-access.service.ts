import { Injectable } from '@nestjs/common';
import { VerificationService } from './verification.service';

interface PricingTier {
  minQty: number;
  maxQty: number | null;
  pricePerUnit: number;
}

export interface PricingResult {
  showB2BPricing: boolean;
  b2cPrice: number;
  b2bTiers?: PricingTier[];
  currency: string;
  message?: string;
}

@Injectable()
export class PricingAccessService {
  constructor(private readonly verificationService: VerificationService) {}

  /**
   * Get pricing visibility for a user.
   */
  async getPricingForUser(
    userId: string | null,
    b2cPrice: number,
    b2bTiers: PricingTier[] | null,
    currency: string = 'INR',
  ): Promise<PricingResult> {
    // Guest user (not logged in)
    if (!userId) {
      return {
        showB2BPricing: false,
        b2cPrice,
        currency,
        message: 'Login and verify your business to see wholesale prices',
      };
    }

    const status = await this.verificationService.getVerificationStatus(userId);

    // B2B verified user
    if (status.canSeeB2BPricing && b2bTiers && b2bTiers.length > 0) {
      return {
        showB2BPricing: true,
        b2cPrice,
        b2bTiers,
        currency,
      };
    }

    // Individual or unverified business
    return {
      showB2BPricing: false,
      b2cPrice,
      currency,
      message: status.registrationType === 'BUSINESS'
        ? 'Verify your GST to unlock wholesale pricing'
        : 'Register as a business to see wholesale prices',
    };
  }

  /**
   * Calculate price for quantity based on user type.
   */
  async calculatePrice(
    userId: string | null,
    quantity: number,
    b2cPrice: number,
    b2bTiers: PricingTier[] | null,
  ): Promise<{ unitPrice: number; totalPrice: number; tier?: string }> {
    const pricing = await this.getPricingForUser(userId, b2cPrice, b2bTiers);

    if (!pricing.showB2BPricing || !pricing.b2bTiers) {
      return {
        unitPrice: b2cPrice,
        totalPrice: b2cPrice * quantity,
      };
    }

    // Find applicable B2B tier
    const applicableTier = pricing.b2bTiers.find(
      (tier) => quantity >= tier.minQty && (tier.maxQty === null || quantity <= tier.maxQty),
    );

    if (applicableTier) {
      return {
        unitPrice: applicableTier.pricePerUnit,
        totalPrice: applicableTier.pricePerUnit * quantity,
        tier: `${applicableTier.minQty}-${applicableTier.maxQty ?? '∞'}`,
      };
    }

    return {
      unitPrice: b2cPrice,
      totalPrice: b2cPrice * quantity,
    };
  }
}
