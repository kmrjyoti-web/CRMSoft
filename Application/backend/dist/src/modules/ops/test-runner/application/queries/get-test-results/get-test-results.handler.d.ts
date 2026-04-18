import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from "../../../../../../core/prisma/prisma.service";
import { GetTestResultsQuery } from './get-test-results.query';
export declare class GetTestResultsHandler implements IQueryHandler<GetTestResultsQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetTestResultsQuery): Promise<Record<string, unknown>[]>;
}
