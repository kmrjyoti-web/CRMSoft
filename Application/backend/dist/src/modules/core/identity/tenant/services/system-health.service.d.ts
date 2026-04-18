import { PrismaService } from '../../../../../core/prisma/prisma.service';
export declare class SystemHealthService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    checkDatabase(): Promise<{
        ok: boolean;
        latencyMs: number;
    }>;
}
