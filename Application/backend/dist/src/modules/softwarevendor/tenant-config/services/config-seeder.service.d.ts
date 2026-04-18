import { PrismaService } from '../../../../core/prisma/prisma.service';
export declare class ConfigSeederService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    seedDefaults(tenantId: string): Promise<{
        seeded: number;
    }>;
}
