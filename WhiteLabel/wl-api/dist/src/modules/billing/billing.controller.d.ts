import { BillingService } from './billing.service';
declare class RecordUsageDto {
    partnerId: string;
    serviceCode: string;
    units: number;
}
declare class MarkPaidDto {
    razorpayPaymentId?: string;
}
export declare class BillingController {
    private billingService;
    constructor(billingService: BillingService);
    recordUsage(dto: RecordUsageDto): Promise<{
        id: string;
        serviceCode: string;
        createdAt: Date;
        partnerId: string;
        period: string;
        totalUnitsConsumed: import("@prisma/client-runtime-utils").Decimal;
        totalCostToYou: import("@prisma/client-runtime-utils").Decimal;
        totalChargedToPartner: import("@prisma/client-runtime-utils").Decimal;
        totalChargedToCustomers: import("@prisma/client-runtime-utils").Decimal;
        yourProfit: import("@prisma/client-runtime-utils").Decimal;
        partnerProfit: import("@prisma/client-runtime-utils").Decimal;
        invoiceId: string | null;
    }>;
    getUsageSummary(partnerId: string, period?: string): Promise<{
        partnerId: string;
        period: string;
        services: ({
            partner: {
                companyName: string;
            };
        } & {
            id: string;
            serviceCode: string;
            createdAt: Date;
            partnerId: string;
            period: string;
            totalUnitsConsumed: import("@prisma/client-runtime-utils").Decimal;
            totalCostToYou: import("@prisma/client-runtime-utils").Decimal;
            totalChargedToPartner: import("@prisma/client-runtime-utils").Decimal;
            totalChargedToCustomers: import("@prisma/client-runtime-utils").Decimal;
            yourProfit: import("@prisma/client-runtime-utils").Decimal;
            partnerProfit: import("@prisma/client-runtime-utils").Decimal;
            invoiceId: string | null;
        })[];
        totals: {
            totalCostToYou: number;
            totalChargedToPartner: number;
            totalChargedToCustomers: number;
            yourProfit: number;
            partnerProfit: number;
        };
    }>;
    getUsageByPeriod(partnerId: string, period: string): Promise<{
        partnerId: string;
        period: string;
        services: ({
            partner: {
                companyName: string;
            };
        } & {
            id: string;
            serviceCode: string;
            createdAt: Date;
            partnerId: string;
            period: string;
            totalUnitsConsumed: import("@prisma/client-runtime-utils").Decimal;
            totalCostToYou: import("@prisma/client-runtime-utils").Decimal;
            totalChargedToPartner: import("@prisma/client-runtime-utils").Decimal;
            totalChargedToCustomers: import("@prisma/client-runtime-utils").Decimal;
            yourProfit: import("@prisma/client-runtime-utils").Decimal;
            partnerProfit: import("@prisma/client-runtime-utils").Decimal;
            invoiceId: string | null;
        })[];
        totals: {
            totalCostToYou: number;
            totalChargedToPartner: number;
            totalChargedToCustomers: number;
            yourProfit: number;
            partnerProfit: number;
        };
    }>;
    generateInvoice(partnerId: string, period: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.InvoiceStatus;
        partnerId: string;
        dueDate: Date;
        period: string;
        invoiceNumber: string;
        lineItems: import("@prisma/client/runtime/client").JsonValue;
        subtotal: import("@prisma/client-runtime-utils").Decimal;
        gstAmount: import("@prisma/client-runtime-utils").Decimal;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
        paidAt: Date | null;
        razorpayPaymentId: string | null;
    }>;
    sendInvoice(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.InvoiceStatus;
        partnerId: string;
        dueDate: Date;
        period: string;
        invoiceNumber: string;
        lineItems: import("@prisma/client/runtime/client").JsonValue;
        subtotal: import("@prisma/client-runtime-utils").Decimal;
        gstAmount: import("@prisma/client-runtime-utils").Decimal;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
        paidAt: Date | null;
        razorpayPaymentId: string | null;
    }>;
    markPaid(id: string, dto: MarkPaidDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.InvoiceStatus;
        partnerId: string;
        dueDate: Date;
        period: string;
        invoiceNumber: string;
        lineItems: import("@prisma/client/runtime/client").JsonValue;
        subtotal: import("@prisma/client-runtime-utils").Decimal;
        gstAmount: import("@prisma/client-runtime-utils").Decimal;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
        paidAt: Date | null;
        razorpayPaymentId: string | null;
    }>;
    getBillingDashboard(): Promise<{
        totalRevenue: number;
        pendingAmount: number;
        paidInvoices: number;
        overdueInvoices: number;
    }>;
    getPartnerInvoices(partnerId: string, page?: string, limit?: string): Promise<{
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.InvoiceStatus;
            partnerId: string;
            dueDate: Date;
            period: string;
            invoiceNumber: string;
            lineItems: import("@prisma/client/runtime/client").JsonValue;
            subtotal: import("@prisma/client-runtime-utils").Decimal;
            gstAmount: import("@prisma/client-runtime-utils").Decimal;
            totalAmount: import("@prisma/client-runtime-utils").Decimal;
            paidAt: Date | null;
            razorpayPaymentId: string | null;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
        };
    }>;
    getInvoice(id: string): Promise<{
        partner: {
            email: string;
            companyName: string;
            billingAddress: import("@prisma/client/runtime/client").JsonValue;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.InvoiceStatus;
        partnerId: string;
        dueDate: Date;
        period: string;
        invoiceNumber: string;
        lineItems: import("@prisma/client/runtime/client").JsonValue;
        subtotal: import("@prisma/client-runtime-utils").Decimal;
        gstAmount: import("@prisma/client-runtime-utils").Decimal;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
        paidAt: Date | null;
        razorpayPaymentId: string | null;
    }>;
}
export {};
