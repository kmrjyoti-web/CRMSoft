import { PlatformConsolePrismaService } from '../prisma/platform-console-prisma.service';
export declare class BrandErrorSummaryCron {
    private readonly db;
    private readonly logger;
    constructor(db: PlatformConsolePrismaService);
    aggregateMonthlyErrors(): Promise<void>;
}
