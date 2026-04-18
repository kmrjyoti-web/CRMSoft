import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { CompanyProfile } from '@prisma/working-client';
export declare class CompanyProfileService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    get(tenantId: string): Promise<CompanyProfile>;
    update(tenantId: string, data: Partial<CompanyProfile>, userId?: string): Promise<CompanyProfile>;
    getPublic(tenantId: string): Promise<Partial<CompanyProfile>>;
}
