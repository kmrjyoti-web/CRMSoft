import { PrismaService } from '../../../../core/prisma/prisma.service';
export declare class QuotationExpiryService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    checkExpiry(): Promise<void>;
}
