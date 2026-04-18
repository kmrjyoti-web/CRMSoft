import { IQueryHandler } from '@nestjs/cqrs';
import { GetNegotiationHistoryQuery } from './get-negotiation-history.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class GetNegotiationHistoryHandler implements IQueryHandler<GetNegotiationHistoryQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetNegotiationHistoryQuery): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        outcome: string | null;
        quotationId: string;
        note: string | null;
        contactPersonId: string | null;
        negotiationType: import("@prisma/working-client").$Enums.NegotiationType;
        customerRequirement: string | null;
        customerBudget: import("@prisma/working-client/runtime/library").Decimal | null;
        customerPriceExpected: import("@prisma/working-client/runtime/library").Decimal | null;
        ourPrice: import("@prisma/working-client/runtime/library").Decimal | null;
        proposedDiscount: import("@prisma/working-client/runtime/library").Decimal | null;
        counterOfferAmount: import("@prisma/working-client/runtime/library").Decimal | null;
        itemsAdded: import("@prisma/working-client/runtime/library").JsonValue | null;
        itemsRemoved: import("@prisma/working-client/runtime/library").JsonValue | null;
        itemsModified: import("@prisma/working-client/runtime/library").JsonValue | null;
        termsChanged: string | null;
        contactPersonName: string | null;
        loggedById: string;
        loggedByName: string;
        loggedAt: Date;
    }[]>;
}
