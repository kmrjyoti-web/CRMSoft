import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from "../../../../../../core/prisma/prisma.service";
import { CompareTestRunsQuery } from './compare-test-runs.query';
export declare class CompareTestRunsHandler implements IQueryHandler<CompareTestRunsQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: CompareTestRunsQuery): Promise<Record<string, unknown>>;
}
