import { PrismaService } from '../../../../core/prisma/prisma.service';
export declare class UnitConverterService {
    convert(prisma: PrismaService, params: {
        productId: string;
        quantity: number;
        fromUnit: string;
        toUnit: string;
    }): Promise<{
        quantity: number;
        unit: string;
        conversionRate: number;
    }>;
}
