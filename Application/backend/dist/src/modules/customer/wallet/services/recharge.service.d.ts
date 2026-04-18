import { PrismaService } from '../../../../core/prisma/prisma.service';
import { WalletTransactionService } from './wallet-transaction.service';
import { CouponService } from './coupon.service';
export declare class RechargeService {
    private readonly prisma;
    private readonly txnService;
    private readonly couponService;
    constructor(prisma: PrismaService, txnService: WalletTransactionService, couponService: CouponService);
    listPlans(activeOnly?: boolean, industryCode?: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        sortOrder: number;
        industryCode: string | null;
        amount: import("@prisma/platform-client/runtime/library").Decimal;
        tokens: number;
        bonusTokens: number;
    }[]>;
    getPlan(id: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        sortOrder: number;
        industryCode: string | null;
        amount: import("@prisma/platform-client/runtime/library").Decimal;
        tokens: number;
        bonusTokens: number;
    }>;
    createPlan(data: {
        name: string;
        amount: number;
        tokens: number;
        bonusTokens?: number;
        description?: string;
        sortOrder?: number;
    }): Promise<{
        id: string;
        name: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        sortOrder: number;
        industryCode: string | null;
        amount: import("@prisma/platform-client/runtime/library").Decimal;
        tokens: number;
        bonusTokens: number;
    }>;
    updatePlan(id: string, data: Partial<{
        name: string;
        amount: number;
        tokens: number;
        bonusTokens: number;
        description: string;
        sortOrder: number;
        isActive: boolean;
    }>): Promise<{
        id: string;
        name: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        sortOrder: number;
        industryCode: string | null;
        amount: import("@prisma/platform-client/runtime/library").Decimal;
        tokens: number;
        bonusTokens: number;
    }>;
    deletePlan(id: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        sortOrder: number;
        industryCode: string | null;
        amount: import("@prisma/platform-client/runtime/library").Decimal;
        tokens: number;
        bonusTokens: number;
    }>;
    initiateRecharge(tenantId: string, planId: string, couponCode?: string): Promise<{
        planId: string;
        planName: string;
        amount: import("@prisma/platform-client/runtime/library").Decimal;
        baseTokens: number;
        bonusTokens: number;
        couponBonus: number;
        totalTokens: number;
        coupon: {
            valid: boolean;
            bonusTokens: number;
            message: string;
            couponId?: string;
        } | null;
    }>;
    completeRecharge(tenantId: string, planId: string, paymentId: string, couponCode?: string, userId?: string): Promise<{
        transaction: any;
        newBalance: any;
    }>;
}
