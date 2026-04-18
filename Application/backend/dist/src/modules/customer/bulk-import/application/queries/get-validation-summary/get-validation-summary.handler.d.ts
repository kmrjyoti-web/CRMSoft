import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetValidationSummaryQuery } from './get-validation-summary.query';
export declare class GetValidationSummaryHandler implements IQueryHandler<GetValidationSummaryQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetValidationSummaryQuery): Promise<{
        statusCounts: Record<string, number>;
        topErrors: {
            error: string;
            count: number;
        }[];
        totalRows: number;
    }>;
}
