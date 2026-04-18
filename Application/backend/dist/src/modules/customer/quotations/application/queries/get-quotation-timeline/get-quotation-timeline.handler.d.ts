import { IQueryHandler } from '@nestjs/cqrs';
import { GetQuotationTimelineQuery } from './get-quotation-timeline.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class GetQuotationTimelineHandler implements IQueryHandler<GetQuotationTimelineQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetQuotationTimelineQuery): Promise<{
        id: string;
        tenantId: string;
        description: string;
        createdAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        action: string;
        newValue: string | null;
        performedById: string;
        performedByName: string;
        quotationId: string;
        previousValue: string | null;
        changedField: string | null;
    }[]>;
}
