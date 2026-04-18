import { PrismaService } from '../../../../core/prisma/prisma.service';
import { CrossDbResolverService } from '../../../../core/prisma/cross-db-resolver.service';
export interface PredictionResult {
    score: number;
    confidence: string;
    recommendations: {
        suggestedProducts: {
            productId: string;
            name: string;
            reason: string;
        }[];
        suggestedPriceRange: {
            min: number;
            max: number;
            optimal: number;
        } | null;
        suggestedDiscount: {
            min: number;
            max: number;
            sweet_spot: number;
        };
        suggestedPriceType: string;
        suggestedPaymentTerms: string;
        suggestedValidityDays: number;
        estimatedTimeToClose: number;
    };
    warnings: string[];
    similarDeals: Record<string, unknown>[];
}
export declare class QuotationPredictionService {
    private readonly prisma;
    private readonly resolver;
    constructor(prisma: PrismaService, resolver: CrossDbResolverService);
    predict(leadId: string): Promise<PredictionResult>;
    getQuestions(leadId: string): Promise<any[]>;
    private avg;
    private mostCommon;
}
