/**
 * Value Object representing the conditions under which an offer is eligible.
 * Parsed from the JSON `conditions` column of MktOffer.
 */
export interface GeoCondition {
  allowedStates?: string[];
  allowedCities?: string[];
  allowedPincodes?: string[];
  blockedStates?: string[];
  blockedCities?: string[];
}

export interface CustomerGroupCondition {
  allowedGrades?: string[];
  allowedGroupIds?: string[];
  requiresVerification?: boolean;
}

export interface OrderBasedCondition {
  minOrderValue?: number;
  maxOrderValue?: number;
  minQuantity?: number;
  maxQuantity?: number;
  productIds?: string[];
  categoryIds?: string[];
}

export interface TimeWindowCondition {
  /** Cron expression like "0 9 * * *" for daily at 9AM */
  cron?: string;
  /** Start time in HH:mm format */
  startTime?: string;
  /** End time in HH:mm format */
  endTime?: string;
  /** Active days 0=Sun, 1=Mon … 6=Sat */
  activeDays?: number[];
  /** Timezone, e.g. "Asia/Kolkata" */
  timezone?: string;
}

export interface OfferConditions {
  geo?: GeoCondition;
  customerGroup?: CustomerGroupCondition;
  orderBased?: OrderBasedCondition;
  timeWindow?: TimeWindowCondition;
  maxPerUser?: number;
  requiresLogin?: boolean;
  customRules?: Record<string, any>;
}

export class OfferConditionsVO {
  readonly geo?: GeoCondition;
  readonly customerGroup?: CustomerGroupCondition;
  readonly orderBased?: OrderBasedCondition;
  readonly timeWindow?: TimeWindowCondition;
  readonly maxPerUser?: number;
  readonly requiresLogin?: boolean;
  readonly customRules?: Record<string, any>;

  constructor(raw: OfferConditions) {
    this.geo = raw.geo;
    this.customerGroup = raw.customerGroup;
    this.orderBased = raw.orderBased;
    this.timeWindow = raw.timeWindow;
    this.maxPerUser = raw.maxPerUser;
    this.requiresLogin = raw.requiresLogin;
    this.customRules = raw.customRules;
  }

  static fromJson(json: any): OfferConditionsVO {
    if (!json || typeof json !== 'object') return new OfferConditionsVO({});
    return new OfferConditionsVO(json as OfferConditions);
  }

  /**
   * Checks if current time is within the configured time window.
   */
  isWithinTimeWindow(): boolean {
    const tw = this.timeWindow;
    if (!tw) return true;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentDay = now.getDay(); // 0=Sun

    // Check active days
    if (tw.activeDays && tw.activeDays.length > 0) {
      if (!tw.activeDays.includes(currentDay)) return false;
    }

    // Check time window
    if (tw.startTime && tw.endTime) {
      const [startH, startM] = tw.startTime.split(':').map(Number);
      const [endH, endM] = tw.endTime.split(':').map(Number);
      const currentMins = currentHour * 60 + currentMinute;
      const startMins = startH * 60 + startM;
      const endMins = endH * 60 + endM;
      if (currentMins < startMins || currentMins > endMins) return false;
    }

    return true;
  }

  /**
   * Check if user's location is allowed by geo conditions.
   */
  isGeoAllowed(params: { city?: string; state?: string; pincode?: string }): boolean {
    const geo = this.geo;
    if (!geo) return true;

    const { city, state, pincode } = params;

    if (geo.blockedStates?.length && state && geo.blockedStates.includes(state)) return false;
    if (geo.blockedCities?.length && city && geo.blockedCities.includes(city)) return false;

    if (geo.allowedStates?.length && state) {
      if (!geo.allowedStates.includes(state)) return false;
    }
    if (geo.allowedCities?.length && city) {
      if (!geo.allowedCities.includes(city)) return false;
    }
    if (geo.allowedPincodes?.length && pincode) {
      if (!geo.allowedPincodes.includes(pincode)) return false;
    }

    return true;
  }

  /**
   * Check if the customer's grade/group is allowed.
   */
  isCustomerGroupAllowed(params: { grade?: string; groupId?: string; isVerified?: boolean }): boolean {
    const cg = this.customerGroup;
    if (!cg) return true;

    if (cg.requiresVerification && !params.isVerified) return false;
    if (cg.allowedGrades?.length && params.grade) {
      if (!cg.allowedGrades.includes(params.grade)) return false;
    }
    if (cg.allowedGroupIds?.length && params.groupId) {
      if (!cg.allowedGroupIds.includes(params.groupId)) return false;
    }

    return true;
  }

  /**
   * Check if the order meets the order-based conditions.
   */
  isOrderEligible(params: { orderValue?: number; quantity?: number; productId?: string; categoryId?: string }): boolean {
    const ob = this.orderBased;
    if (!ob) return true;

    if (ob.minOrderValue !== undefined && (params.orderValue ?? 0) < ob.minOrderValue) return false;
    if (ob.maxOrderValue !== undefined && (params.orderValue ?? 0) > ob.maxOrderValue) return false;
    if (ob.minQuantity !== undefined && (params.quantity ?? 0) < ob.minQuantity) return false;
    if (ob.maxQuantity !== undefined && (params.quantity ?? 0) > ob.maxQuantity) return false;

    if (ob.productIds?.length && params.productId) {
      if (!ob.productIds.includes(params.productId)) return false;
    }
    if (ob.categoryIds?.length && params.categoryId) {
      if (!ob.categoryIds.includes(params.categoryId)) return false;
    }

    return true;
  }
}
