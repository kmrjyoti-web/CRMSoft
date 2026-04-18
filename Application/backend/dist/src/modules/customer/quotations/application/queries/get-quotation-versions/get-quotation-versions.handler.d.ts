import { IQueryHandler } from '@nestjs/cqrs';
import { GetQuotationVersionsQuery } from './get-quotation-versions.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class GetQuotationVersionsHandler implements IQueryHandler<GetQuotationVersionsQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetQuotationVersionsQuery): Promise<Record<string, unknown>[]>;
    private collectVersions;
}
