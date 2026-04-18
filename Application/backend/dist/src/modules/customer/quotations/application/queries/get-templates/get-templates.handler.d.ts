import { IQueryHandler } from '@nestjs/cqrs';
import { GetTemplatesQuery } from './get-templates.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class GetTemplatesHandler implements IQueryHandler<GetTemplatesQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetTemplatesQuery): Promise<{
        id: string;
        tenantId: string;
        name: string;
        description: string | null;
        isActive: boolean;
        createdById: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        usageCount: number;
        industry: string | null;
        coverNote: string | null;
        defaultItems: import("@prisma/working-client/runtime/library").JsonValue | null;
        defaultTerms: string | null;
        defaultPayment: string | null;
        defaultDelivery: string | null;
        defaultWarranty: string | null;
        winRate: import("@prisma/working-client/runtime/library").Decimal | null;
    }[]>;
}
