import { OfferConditionsVO } from '../value-objects/offer-conditions.vo';

export type OfferType = 'ONE_TIME' | 'DAILY_RECURRING' | 'WEEKLY_RECURRING' | 'FIRST_N_ORDERS' | 'LAUNCH' | 'CUSTOM';
export type DiscountType = 'PERCENTAGE' | 'FLAT_AMOUNT' | 'FREE_SHIPPING' | 'BUY_X_GET_Y' | 'BUNDLE_PRICE';
export type OfferStatus = 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'PAUSED' | 'EXPIRED' | 'CLOSED' | 'ARCHIVED';

export interface EligibilityParams {
  userId?: string;
  city?: string;
  state?: string;
  pincode?: string;
  grade?: string;
  groupId?: string;
  isVerified?: boolean;
  orderValue?: number;
  quantity?: number;
  productId?: string;
  categoryId?: string;
  userRedemptionCount?: number;
}

export interface EligibilityResult {
  eligible: boolean;
  reason?: string;
}

export interface OfferProps {
  id: string;
  tenantId: string;
  authorId: string;
  title: string;
  description?: string;
  mediaUrls?: string[];
  offerType: OfferType;
  discountType: DiscountType;
  discountValue: number;
  linkedListingIds?: string[];
  linkedCategoryIds?: string[];
  primaryListingId?: string;
  conditions?: Record<string, unknown>;
  maxRedemptions?: number;
  currentRedemptions?: number;
  autoCloseOnLimit?: boolean;
  resetTime?: string;
  lastResetAt?: Date;
  status?: OfferStatus;
  publishAt?: Date;
  expiresAt?: Date;
  publishedAt?: Date;
  closedAt?: Date;
  closedReason?: string;
  createdById: string;
}

export class OfferEntity {
  readonly id: string;
  readonly tenantId: string;
  readonly authorId: string;
  title: string;
  description?: string;
  mediaUrls?: string[];
  readonly offerType: OfferType;
  readonly discountType: DiscountType;
  discountValue: number;
  linkedListingIds: string[];
  linkedCategoryIds: string[];
  primaryListingId?: string;
  conditions: OfferConditionsVO;
  maxRedemptions?: number;
  currentRedemptions: number;
  autoCloseOnLimit: boolean;
  resetTime?: string;
  lastResetAt?: Date;
  status: OfferStatus;
  publishAt?: Date;
  expiresAt?: Date;
  publishedAt?: Date;
  closedAt?: Date;
  closedReason?: string;
  readonly createdById: string;
  createdAt: Date;
  updatedAt: Date;

  private constructor(props: OfferProps) {
    this.id = props.id;
    this.tenantId = props.tenantId;
    this.authorId = props.authorId;
    this.title = props.title;
    this.description = props.description;
    this.mediaUrls = props.mediaUrls || [];
    this.offerType = props.offerType;
    this.discountType = props.discountType;
    this.discountValue = props.discountValue;
    this.linkedListingIds = props.linkedListingIds || [];
    this.linkedCategoryIds = props.linkedCategoryIds || [];
    this.primaryListingId = props.primaryListingId;
    this.conditions = OfferConditionsVO.fromJson(props.conditions || {});
    this.maxRedemptions = props.maxRedemptions;
    this.currentRedemptions = props.currentRedemptions || 0;
    this.autoCloseOnLimit = props.autoCloseOnLimit !== false;
    this.resetTime = props.resetTime;
    this.lastResetAt = props.lastResetAt;
    this.status = props.status || 'DRAFT';
    this.publishAt = props.publishAt;
    this.expiresAt = props.expiresAt;
    this.publishedAt = props.publishedAt;
    this.closedAt = props.closedAt;
    this.closedReason = props.closedReason;
    this.createdById = props.createdById;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  static create(props: OfferProps): OfferEntity {
    return new OfferEntity(props);
  }

  static fromPrisma(raw: any): OfferEntity {
    return new OfferEntity({
      ...raw,
      conditions: raw.conditions,
    });
  }

  /**
   * Returns true if the offer is currently active based on time conditions.
   * Checks: status=ACTIVE, not expired, and time window conditions.
   */
  isActiveNow(): boolean {
    if (this.status !== 'ACTIVE') return false;

    const now = new Date();
    if (this.expiresAt && now > this.expiresAt) return false;

    // DAILY_RECURRING: check time window
    if (this.offerType === 'DAILY_RECURRING') {
      return this.conditions.isWithinTimeWindow();
    }

    // WEEKLY_RECURRING: check active days and time window
    if (this.offerType === 'WEEKLY_RECURRING') {
      return this.conditions.isWithinTimeWindow();
    }

    // FIRST_N_ORDERS: check if redemption limit reached
    if (this.offerType === 'FIRST_N_ORDERS') {
      if (this.maxRedemptions !== undefined && this.currentRedemptions >= this.maxRedemptions) {
        return false;
      }
    }

    return true;
  }

  /**
   * Evaluates all eligibility conditions for the given user/order parameters.
   */
  isEligible(params: EligibilityParams): EligibilityResult {
    if (!this.isActiveNow()) {
      return { eligible: false, reason: 'Offer is not currently active' };
    }

    // Geo check
    if (!this.conditions.isGeoAllowed({ city: params.city, state: params.state, pincode: params.pincode })) {
      return { eligible: false, reason: 'Offer not available in your location' };
    }

    // Customer group check
    if (!this.conditions.isCustomerGroupAllowed({
      grade: params.grade,
      groupId: params.groupId,
      isVerified: params.isVerified,
    })) {
      return { eligible: false, reason: 'You are not eligible for this offer based on your customer group' };
    }

    // Order-based check
    if (!this.conditions.isOrderEligible({
      orderValue: params.orderValue,
      quantity: params.quantity,
      productId: params.productId,
      categoryId: params.categoryId,
    })) {
      return { eligible: false, reason: 'Order does not meet the minimum requirements for this offer' };
    }

    // Per-user redemption limit
    const maxPerUser = this.conditions.maxPerUser;
    if (maxPerUser !== undefined && params.userRedemptionCount !== undefined) {
      if (params.userRedemptionCount >= maxPerUser) {
        return { eligible: false, reason: `You have reached the maximum redemptions (${maxPerUser}) for this offer` };
      }
    }

    // Global redemption limit
    if (this.maxRedemptions !== undefined && this.currentRedemptions >= this.maxRedemptions) {
      return { eligible: false, reason: 'Offer redemption limit has been reached' };
    }

    return { eligible: true };
  }

  /**
   * Records a redemption. Throws if offer is not eligible or limit is reached.
   */
  redeem(userId: string, orderInfo?: { orderValue?: number; quantity?: number }): void {
    if (this.maxRedemptions !== undefined && this.currentRedemptions >= this.maxRedemptions) {
      throw new Error('Offer redemption limit has been reached');
    }

    if (!this.isActiveNow()) {
      throw new Error('Offer is not currently active');
    }

    this.currentRedemptions += 1;

    if (this.autoCloseOnLimit && this.maxRedemptions !== undefined && this.currentRedemptions >= this.maxRedemptions) {
      this.close('Redemption limit reached');
    }
  }

  /**
   * Resets the daily/weekly counter (for recurring offers).
   */
  resetCounter(): void {
    if (this.offerType !== 'DAILY_RECURRING' && this.offerType !== 'WEEKLY_RECURRING') {
      throw new Error(`Cannot reset counter for offer type: ${this.offerType}`);
    }
    this.currentRedemptions = 0;
    this.lastResetAt = new Date();
  }

  /**
   * Closes the offer with a reason.
   */
  close(reason: string): void {
    this.status = 'CLOSED';
    this.closedAt = new Date();
    this.closedReason = reason;
  }

  /**
   * Activates the offer (transitions from DRAFT/SCHEDULED to ACTIVE).
   */
  activate(): void {
    if (this.status !== 'DRAFT' && this.status !== 'SCHEDULED' && this.status !== 'PAUSED') {
      throw new Error(`Cannot activate offer in status: ${this.status}`);
    }
    this.status = 'ACTIVE';
    if (!this.publishedAt) this.publishedAt = new Date();
  }

  /**
   * Calculates the discount amount for a given order value.
   */
  calculateDiscount(orderValue: number, quantity?: number): number {
    switch (this.discountType) {
      case 'PERCENTAGE':
        return Math.round((orderValue * this.discountValue) / 100);
      case 'FLAT_AMOUNT':
        return Math.min(this.discountValue, orderValue);
      case 'FREE_SHIPPING':
        return this.discountValue; // shipping cost to waive
      case 'BUNDLE_PRICE':
        return Math.max(0, orderValue - this.discountValue);
      default:
        return 0;
    }
  }
}
