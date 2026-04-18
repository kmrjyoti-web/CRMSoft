import { ICommandHandler } from '@nestjs/cqrs';
import { RecordPaymentCommand } from './record-payment.command';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
export declare class RecordPaymentHandler implements ICommandHandler<RecordPaymentCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(command: RecordPaymentCommand): Promise<{
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
}
