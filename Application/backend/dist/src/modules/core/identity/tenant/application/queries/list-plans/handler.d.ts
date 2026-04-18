import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { ListPlansQuery } from './query';
export declare class ListPlansHandler implements IQueryHandler<ListPlansQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: ListPlansQuery): Promise<{
        id: string;
        name: string;
        code: string;
        description: string | null;
        isActive: boolean;
        configJson: import("@prisma/identity-client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        sortOrder: number;
        currency: string;
        interval: import("@prisma/identity-client").$Enums.PlanInterval;
        price: import("@prisma/identity-client/runtime/library").Decimal;
        maxUsers: number;
        maxContacts: number;
        maxLeads: number;
        maxProducts: number;
        maxStorage: number;
        features: import("@prisma/identity-client").$Enums.FeatureFlag[];
    }[]>;
}
