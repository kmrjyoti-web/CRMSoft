import { PrismaService } from '../../../../core/prisma/prisma.service';
export declare class PaymentSeederService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    seedAll(tenantId: string): Promise<void>;
    private seedAutoNumbers;
    private seedTenantConfigs;
    private seedCronJobs;
}
