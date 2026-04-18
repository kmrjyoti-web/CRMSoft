import { PrismaService } from '../../../../../core/prisma/prisma.service';
export declare class InvoiceGeneratorService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    generate(data: {
        tenantId: string;
        subscriptionId: string;
        periodStart: Date;
        periodEnd: Date;
        amount: number;
        tax: number;
    }): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        status: import("@prisma/identity-client").$Enums.PaymentStatus;
        tax: import("@prisma/identity-client/runtime/library").Decimal;
        amount: import("@prisma/identity-client/runtime/library").Decimal;
        total: import("@prisma/identity-client/runtime/library").Decimal;
        gatewayPaymentId: string | null;
        invoiceNumber: string;
        paidAt: Date | null;
        periodStart: Date;
        periodEnd: Date;
        pdfUrl: string | null;
    }>;
    generatePdf(invoiceId: string): Promise<string>;
}
