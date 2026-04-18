import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from "../../../../../../core/prisma/prisma.service";
import { GetTestResultsTreeQuery } from './get-test-results-tree.query';
export declare class GetTestResultsTreeHandler implements IQueryHandler<GetTestResultsTreeQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetTestResultsTreeQuery): Promise<any>;
}
