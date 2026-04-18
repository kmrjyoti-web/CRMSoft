"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfferConditionsVO = void 0;
class OfferConditionsVO {
    constructor(raw) {
        this.geo = raw.geo;
        this.customerGroup = raw.customerGroup;
        this.orderBased = raw.orderBased;
        this.timeWindow = raw.timeWindow;
        this.maxPerUser = raw.maxPerUser;
        this.requiresLogin = raw.requiresLogin;
        this.customRules = raw.customRules;
    }
    static fromJson(json) {
        if (!json || typeof json !== 'object')
            return new OfferConditionsVO({});
        return new OfferConditionsVO(json);
    }
    isWithinTimeWindow() {
        const tw = this.timeWindow;
        if (!tw)
            return true;
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentDay = now.getDay();
        if (tw.activeDays && tw.activeDays.length > 0) {
            if (!tw.activeDays.includes(currentDay))
                return false;
        }
        if (tw.startTime && tw.endTime) {
            const [startH, startM] = tw.startTime.split(':').map(Number);
            const [endH, endM] = tw.endTime.split(':').map(Number);
            const currentMins = currentHour * 60 + currentMinute;
            const startMins = startH * 60 + startM;
            const endMins = endH * 60 + endM;
            if (currentMins < startMins || currentMins > endMins)
                return false;
        }
        return true;
    }
    isGeoAllowed(params) {
        const geo = this.geo;
        if (!geo)
            return true;
        const { city, state, pincode } = params;
        if (geo.blockedStates?.length && state && geo.blockedStates.includes(state))
            return false;
        if (geo.blockedCities?.length && city && geo.blockedCities.includes(city))
            return false;
        if (geo.allowedStates?.length && state) {
            if (!geo.allowedStates.includes(state))
                return false;
        }
        if (geo.allowedCities?.length && city) {
            if (!geo.allowedCities.includes(city))
                return false;
        }
        if (geo.allowedPincodes?.length && pincode) {
            if (!geo.allowedPincodes.includes(pincode))
                return false;
        }
        return true;
    }
    isCustomerGroupAllowed(params) {
        const cg = this.customerGroup;
        if (!cg)
            return true;
        if (cg.requiresVerification && !params.isVerified)
            return false;
        if (cg.allowedGrades?.length && params.grade) {
            if (!cg.allowedGrades.includes(params.grade))
                return false;
        }
        if (cg.allowedGroupIds?.length && params.groupId) {
            if (!cg.allowedGroupIds.includes(params.groupId))
                return false;
        }
        return true;
    }
    isOrderEligible(params) {
        const ob = this.orderBased;
        if (!ob)
            return true;
        if (ob.minOrderValue !== undefined && (params.orderValue ?? 0) < ob.minOrderValue)
            return false;
        if (ob.maxOrderValue !== undefined && (params.orderValue ?? 0) > ob.maxOrderValue)
            return false;
        if (ob.minQuantity !== undefined && (params.quantity ?? 0) < ob.minQuantity)
            return false;
        if (ob.maxQuantity !== undefined && (params.quantity ?? 0) > ob.maxQuantity)
            return false;
        if (ob.productIds?.length && params.productId) {
            if (!ob.productIds.includes(params.productId))
                return false;
        }
        if (ob.categoryIds?.length && params.categoryId) {
            if (!ob.categoryIds.includes(params.categoryId))
                return false;
        }
        return true;
    }
}
exports.OfferConditionsVO = OfferConditionsVO;
//# sourceMappingURL=offer-conditions.vo.js.map