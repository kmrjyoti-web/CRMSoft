import { ICommandHandler } from '@nestjs/cqrs';
import { GenerateInvoiceCommand } from './generate-invoice.command';
import { InvoiceGeneratorService } from '../../../services/invoice-generator.service';
export declare class GenerateInvoiceHandler implements ICommandHandler<GenerateInvoiceCommand> {
    private readonly invoiceGenerator;
    private readonly logger;
    constructor(invoiceGenerator: InvoiceGeneratorService);
    execute(command: GenerateInvoiceCommand): Promise<{
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
