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
export declare class PricingAccessService {
    private readonly verificationService;
    constructor(verificationService: VerificationService);
    getPricingForUser(userId: string | null, b2cPrice: number, b2bTiers: PricingTier[] | null, currency?: string): Promise<PricingResult>;
    calculatePrice(userId: string | null, quantity: number, b2cPrice: number, b2bTiers: PricingTier[] | null): Promise<{
        unitPrice: number;
        totalPrice: number;
        tier?: string;
    }>;
}
export {};
