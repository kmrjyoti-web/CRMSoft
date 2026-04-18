import { IQueryHandler } from '@nestjs/cqrs';
import { GetRequirementQuotesQuery } from './get-requirement-quotes.query';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';
export declare class GetRequirementQuotesHandler implements IQueryHandler<GetRequirementQuotesQuery> {
    private readonly mktPrisma;
    private readonly logger;
    constructor(mktPrisma: MktPrismaService);
    execute(query: GetRequirementQuotesQuery): Promise<{
        data: {
            id: string;
            tenantId: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            notes: string | null;
            quantity: number;
            creditDays: number | null;
            pricePerUnit: number;
            deliveryDays: number;
            certifications: string[];
            requirementId: string;
            sellerId: string;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
}
