"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingAccessService = void 0;
const common_1 = require("@nestjs/common");
const verification_service_1 = require("./verification.service");
let PricingAccessService = class PricingAccessService {
    constructor(verificationService) {
        this.verificationService = verificationService;
    }
    async getPricingForUser(userId, b2cPrice, b2bTiers, currency = 'INR') {
        if (!userId) {
            return {
                showB2BPricing: false,
                b2cPrice,
                currency,
                message: 'Login and verify your business to see wholesale prices',
            };
        }
        const status = await this.verificationService.getVerificationStatus(userId);
        if (status.canSeeB2BPricing && b2bTiers && b2bTiers.length > 0) {
            return {
                showB2BPricing: true,
                b2cPrice,
                b2bTiers,
                currency,
            };
        }
        return {
            showB2BPricing: false,
            b2cPrice,
            currency,
            message: status.registrationType === 'BUSINESS'
                ? 'Verify your GST to unlock wholesale pricing'
                : 'Register as a business to see wholesale prices',
        };
    }
    async calculatePrice(userId, quantity, b2cPrice, b2bTiers) {
        const pricing = await this.getPricingForUser(userId, b2cPrice, b2bTiers);
        if (!pricing.showB2BPricing || !pricing.b2bTiers) {
            return {
                unitPrice: b2cPrice,
                totalPrice: b2cPrice * quantity,
            };
        }
        const applicableTier = pricing.b2bTiers.find((tier) => quantity >= tier.minQty && (tier.maxQty === null || quantity <= tier.maxQty));
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
};
exports.PricingAccessService = PricingAccessService;
exports.PricingAccessService = PricingAccessService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [verification_service_1.VerificationService])
], PricingAccessService);
//# sourceMappingURL=pricing-access.service.js.map