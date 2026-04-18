import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { ListInvoicesQuery } from './query';
export declare class ListInvoicesHandler implements IQueryHandler<ListInvoicesQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: ListInvoicesQuery): Promise<{
        data: {
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
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
}
