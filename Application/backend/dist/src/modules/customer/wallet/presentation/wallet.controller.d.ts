import { ApiResponse } from '../../../../common/utils/api-response';
import { WalletService } from '../services/wallet.service';
import { WalletTransactionService } from '../services/wallet-transaction.service';
import { RechargeService } from '../services/recharge.service';
import { CouponService } from '../services/coupon.service';
import { ServiceRateService } from '../services/service-rate.service';
import { WalletTransactionQueryDto } from './dto/wallet-query.dto';
import { InitiateRechargeDto, CompleteRechargeDto } from './dto/recharge.dto';
import { ApplyCouponDto } from './dto/apply-coupon.dto';
import { CostEstimateDto } from './dto/cost-estimate.dto';
export declare class WalletController {
    private readonly walletService;
    private readonly txnService;
    private readonly rechargeService;
    private readonly couponService;
    private readonly rateService;
    constructor(walletService: WalletService, txnService: WalletTransactionService, rechargeService: RechargeService, couponService: CouponService, rateService: ServiceRateService);
    getBalance(tenantId: string): Promise<ApiResponse<{
        id: null;
        balance: number;
        promoBalance: number;
        totalAvailable: number;
        lifetimeCredit: number;
        lifetimeDebit: number;
        currency: string;
        tokenRate: number;
        isActive: boolean;
    }> | ApiResponse<{
        id: string;
        balance: number;
        promoBalance: number;
        totalAvailable: number;
        lifetimeCredit: number;
        lifetimeDebit: number;
        currency: string;
        tokenRate: number;
        isActive: boolean;
    }>>;
    getTransactions(tenantId: string, query: WalletTransactionQueryDto): Promise<ApiResponse<{
        id: string;
        tenantId: string;
        description: string;
        createdById: string | null;
        createdAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        metadata: import("@prisma/platform-client/runtime/library").JsonValue | null;
        type: import("@prisma/platform-client").$Enums.WalletTxnType;
        status: import("@prisma/platform-client").$Enums.WalletTxnStatus;
        referenceType: string | null;
        referenceId: string | null;
        tokens: number;
        balanceBefore: number;
        balanceAfter: number;
        serviceKey: string | null;
        walletId: string;
    }[]>>;
    initiateRecharge(dto: InitiateRechargeDto, tenantId: string): Promise<ApiResponse<{
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
    }>>;
    completeRecharge(dto: CompleteRechargeDto, tenantId: string, userId: string): Promise<ApiResponse<{
        transaction: any;
        newBalance: any;
    }>>;
    applyCoupon(dto: ApplyCouponDto): Promise<ApiResponse<{
        valid: boolean;
        bonusTokens: number;
        message: string;
        couponId?: string;
    }>>;
    getRechargePlans(): Promise<ApiResponse<{
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
    }[]>>;
    estimateCost(dto: CostEstimateDto, tenantId: string): Promise<ApiResponse<{
        currentBalance: number;
        balanceAfter: number;
        sufficient: boolean;
        serviceKey?: string | undefined;
        displayName?: string | undefined;
        category?: string | undefined;
        baseTokens?: number | undefined;
        marginPct?: number | undefined;
        finalTokens?: number | undefined;
    }>>;
}
