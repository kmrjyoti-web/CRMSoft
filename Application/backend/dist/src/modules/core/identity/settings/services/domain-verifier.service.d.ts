import { PrismaService } from '../../../../../core/prisma/prisma.service';
export declare class DomainVerifierService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    initiate(tenantId: string, domain: string): Promise<{
        domain: string;
        verifyMethod: string;
        verifyToken: string;
        instructions: string;
    }>;
    verify(tenantId: string): Promise<{
        verified: boolean;
        error?: string;
    }>;
}
