import { PrismaService } from '../../../../core/prisma/prisma.service';
export declare class InventoryLabelService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(): Promise<{
        id: string;
        industryCode: string;
        serialNoLabel: string;
        code1Label: string | null;
        code2Label: string | null;
        expiryLabel: string | null;
        stockInLabel: string | null;
        stockOutLabel: string | null;
        locationLabel: string | null;
    }[]>;
    getByIndustry(industryCode: string): Promise<{
        id: string;
        industryCode: string;
        serialNoLabel: string;
        code1Label: string | null;
        code2Label: string | null;
        expiryLabel: string | null;
        stockInLabel: string | null;
        stockOutLabel: string | null;
        locationLabel: string | null;
    } | null>;
    upsert(dto: {
        industryCode: string;
        serialNoLabel?: string;
        code1Label?: string;
        code2Label?: string;
        expiryLabel?: string;
        stockInLabel?: string;
        stockOutLabel?: string;
        locationLabel?: string;
    }): Promise<{
        id: string;
        industryCode: string;
        serialNoLabel: string;
        code1Label: string | null;
        code2Label: string | null;
        expiryLabel: string | null;
        stockInLabel: string | null;
        stockOutLabel: string | null;
        locationLabel: string | null;
    }>;
}
