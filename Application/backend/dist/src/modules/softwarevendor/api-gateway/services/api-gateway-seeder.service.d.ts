import { PrismaService } from '../../../../core/prisma/prisma.service';
import { RateLimitTierService } from './rate-limit-tier.service';
export declare class ApiGatewaySeederService {
    private readonly prisma;
    private readonly rateLimitTier;
    private readonly logger;
    constructor(prisma: PrismaService, rateLimitTier: RateLimitTierService);
    seedAll(tenantId: string): Promise<void>;
    private seedCronJobs;
    private seedTenantConfigs;
}
