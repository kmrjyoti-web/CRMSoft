import { PrismaService } from '../../../../core/prisma/prisma.service';
export declare class QuotationNumberService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    generateNumber(tenantId?: string): Promise<string>;
    generateRevisionNumber(parentNo: string, version: number): string;
}
