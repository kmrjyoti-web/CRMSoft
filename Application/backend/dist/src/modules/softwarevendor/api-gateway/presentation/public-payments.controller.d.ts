import { PrismaService } from '../../../../core/prisma/prisma.service';
import { PaginationQueryDto } from './dto/public-api.dto';
export declare class PublicPaymentsController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(req: any, query: PaginationQueryDto): Promise<{
        data: {
            id: string;
            createdAt: Date;
            status: import("@prisma/working-client").$Enums.PaymentStatus;
            amount: import("@prisma/working-client/runtime/library").Decimal;
            method: import("@prisma/working-client").$Enums.PaymentMethod;
            invoice: {
                id: string;
                invoiceNo: string;
                billingName: string;
            };
            paidAt: Date | null;
            transactionRef: string | null;
            gateway: import("@prisma/working-client").$Enums.PaymentGateway;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getById(req: any, id: string): Promise<{
        receipt: {
            id: string;
            tenantId: string;
            createdAt: Date;
            isDeleted: boolean;
            deletedAt: Date | null;
            updatedById: string | null;
            updatedByName: string | null;
            notes: string | null;
            amount: import("@prisma/working-client/runtime/library").Decimal;
            paymentDate: Date;
            amountInWords: string | null;
            paymentId: string;
            receiptNo: string;
            receivedFrom: string;
            paidFor: string;
            paymentMethod: string;
            generatedById: string;
        } | null;
        invoice: {
            id: string;
            invoiceNo: string;
            billingName: string;
        };
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        status: import("@prisma/working-client").$Enums.PaymentStatus;
        currency: string;
        notes: string | null;
        invoiceId: string;
        amount: import("@prisma/working-client/runtime/library").Decimal;
        method: import("@prisma/working-client").$Enums.PaymentMethod;
        gatewayPaymentId: string | null;
        paidAt: Date | null;
        chequeNumber: string | null;
        chequeDate: Date | null;
        transactionRef: string | null;
        failureReason: string | null;
        paymentNo: string;
        gateway: import("@prisma/working-client").$Enums.PaymentGateway;
        gatewayOrderId: string | null;
        gatewaySignature: string | null;
        gatewayResponse: import("@prisma/working-client/runtime/library").JsonValue | null;
        chequeBankName: string | null;
        upiTransactionId: string | null;
        recordedById: string;
    }>;
}
