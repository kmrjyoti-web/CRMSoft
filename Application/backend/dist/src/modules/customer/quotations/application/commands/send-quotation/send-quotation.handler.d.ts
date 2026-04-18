import { ICommandHandler } from '@nestjs/cqrs';
import { SendQuotationCommand } from './send-quotation.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class SendQuotationHandler implements ICommandHandler<SendQuotationCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(cmd: SendQuotationCommand): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        minValue: import("@prisma/working-client/runtime/library").Decimal | null;
        maxValue: import("@prisma/working-client/runtime/library").Decimal | null;
        organizationId: string | null;
        channel: import("@prisma/working-client").$Enums.QuotationSendChannel;
        message: string | null;
        sentAt: Date;
        pdfUrl: string | null;
        quotationId: string;
        priceType: import("@prisma/working-client").$Enums.QuotationPriceType;
        plusMinusPercent: import("@prisma/working-client/runtime/library").Decimal | null;
        receiverContactId: string | null;
        receiverEmail: string | null;
        receiverPhone: string | null;
        sentById: string;
        sentByName: string;
        receiverName: string | null;
        organizationName: string | null;
        viewedAt: Date | null;
        viewCount: number;
        downloadedAt: Date | null;
        quotationValue: import("@prisma/working-client/runtime/library").Decimal;
    }>;
}
