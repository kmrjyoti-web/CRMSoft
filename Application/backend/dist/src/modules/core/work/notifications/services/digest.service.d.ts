import { PrismaService } from '../../../../../core/prisma/prisma.service';
export declare class DigestService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    processHourlyDigest(): Promise<void>;
    processDailyDigest(): Promise<void>;
    processWeeklyDigest(): Promise<void>;
    private processDigest;
    regroupNotifications(): Promise<void>;
}
