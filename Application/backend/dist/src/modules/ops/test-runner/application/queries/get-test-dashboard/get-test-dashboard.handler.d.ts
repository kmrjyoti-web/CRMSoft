import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from "../../../../../../core/prisma/prisma.service";
import { GetTestDashboardQuery } from './get-test-dashboard.query';
export declare class GetTestDashboardHandler implements IQueryHandler<GetTestDashboardQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetTestDashboardQuery): Promise<Record<string, unknown>>;
}
