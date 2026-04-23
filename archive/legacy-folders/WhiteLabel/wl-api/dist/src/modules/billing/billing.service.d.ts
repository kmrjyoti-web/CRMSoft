import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
export declare class BillingService {
    private prisma;
    private audit;
    constructor(prisma: PrismaService, audit: AuditService);
    private getCurrentPeriod;
    recordUsage(dto: {
        partnerId: string;
        serviceCode: string;
        units: number;
    }): Promise<{
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
    private getNextInvoiceNumber;
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
    sendInvoice(invoiceId: string): Promise<{
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
    markPaid(invoiceId: string, razorpayPaymentId?: string): Promise<{
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
    getPartnerInvoices(partnerId: string, page?: number, limit?: number): Promise<{
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
    getInvoice(invoiceId: string): Promise<{
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
    getBillingDashboard(): Promise<{
        totalRevenue: number;
        pendingAmount: number;
        paidInvoices: number;
        overdueInvoices: number;
    }>;
}
