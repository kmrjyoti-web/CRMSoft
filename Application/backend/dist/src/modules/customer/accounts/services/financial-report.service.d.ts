import { PrismaService } from '../../../../core/prisma/prisma.service';
export declare class FinancialReportService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getProfitAndLoss(tenantId: string, fromDate: string, toDate: string): Promise<{
        period: {
            from: string;
            to: string;
        };
        income: {
            name: string;
            amount: number;
        }[];
        expenses: {
            name: string;
            amount: number;
        }[];
        totalIncome: number;
        totalExpenses: number;
        grossProfit: number;
        netProfit: number;
    }>;
    getBalanceSheet(tenantId: string, asOfDate: string): Promise<{
        asOfDate: string;
        assets: {
            name: string;
            group: string;
            balance: number;
        }[];
        liabilities: {
            name: string;
            group: string;
            balance: number;
        }[];
        equity: {
            name: string;
            group: string;
            balance: number;
        }[];
        totalAssets: number;
        totalLiabilities: number;
        totalEquity: number;
        isBalanced: boolean;
    }>;
    getTrialBalance(tenantId: string, fromDate: string, toDate: string): Promise<{
        period: {
            from: string;
            to: string;
        };
        ledgers: {
            ledgerId: string;
            name: string;
            code: string;
            groupType: string;
            debit: number;
            credit: number;
        }[];
        totalDebit: number;
        totalCredit: number;
        isBalanced: boolean;
    }>;
    getLedgerStatement(tenantId: string, ledgerId: string, fromDate: string, toDate: string): Promise<{
        ledgerName: string;
        ledgerCode: string;
        openingBalance: number;
        closingBalance: number;
        entries: {
            date: Date;
            voucherType: string;
            voucherNumber: string;
            narration: string | null;
            debit: number;
            credit: number;
            balance: number;
        }[];
    } | null>;
    getPayableAging(tenantId: string): Promise<{
        total: {
            current: any;
            aging30: any;
            aging60: any;
            aging90: any;
        };
        current: any[];
        aging30: any[];
        aging60: any[];
        aging90: any[];
    }>;
    getReceivableAging(tenantId: string): Promise<{
        total: {
            current: any;
            aging30: any;
            aging60: any;
            aging90: any;
        };
        current: any[];
        aging30: any[];
        aging60: any[];
        aging90: any[];
    }>;
    getCashFlow(tenantId: string, fromDate: string, toDate: string): Promise<{
        period: {
            from: string;
            to: string;
        };
        operating: number;
        investing: number;
        financing: number;
        netCashFlow: number;
    }>;
    getDayBook(tenantId: string, date: string): Promise<{
        id: string;
        tenantId: string;
        createdById: string;
        createdAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        updatedById: string | null;
        updatedByName: string | null;
        referenceType: string | null;
        referenceId: string | null;
        transactionDate: Date;
        amount: import("@prisma/working-client/runtime/library").Decimal;
        narration: string | null;
        voucherType: string;
        voucherNumber: string;
        debitLedgerId: string;
        creditLedgerId: string;
    }[]>;
}
