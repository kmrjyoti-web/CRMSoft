import { PrismaService } from '../../../../core/prisma/prisma.service';
import { WalletService } from './wallet.service';
export interface DebitParams {
    tokens: number;
    description: string;
    serviceKey?: string;
    referenceType?: string;
    referenceId?: string;
    metadata?: Record<string, any>;
    createdById?: string;
}
export interface CreditParams {
    tokens: number;
    description: string;
    type: 'CREDIT' | 'PROMO' | 'ADJUSTMENT';
    referenceType?: string;
    referenceId?: string;
    metadata?: Record<string, any>;
    createdById?: string;
}
export declare class WalletTransactionService {
    private readonly prisma;
    private readonly walletService;
    constructor(prisma: PrismaService, walletService: WalletService);
    debit(tenantId: string, params: DebitParams): Promise<{
        transaction: any;
        newBalance: any;
    }>;
    credit(tenantId: string, params: CreditParams): Promise<{
        transaction: any;
        newBalance: any;
    }>;
    refund(transactionId: string): Promise<{
        transaction: any;
        newBalance: any;
    }>;
    getHistory(tenantId: string, params?: {
        type?: string;
        page?: number;
        limit?: number;
        from?: string;
        to?: string;
    }): Promise<{
        data: {
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
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
}
