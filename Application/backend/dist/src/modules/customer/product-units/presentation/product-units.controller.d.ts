import { PrismaService } from '../../../../core/prisma/prisma.service';
import { ApiResponse } from '../../../../common/utils/api-response';
import { UnitConverterService } from '../services/unit-converter.service';
import { SetConversionsDto, ConvertDto } from './dto/product-unit.dto';
export declare class ProductUnitsController {
    private readonly prisma;
    private readonly unitConverter;
    constructor(prisma: PrismaService, unitConverter: UnitConverterService);
    setConversions(productId: string, dto: SetConversionsDto): Promise<ApiResponse<any[]>>;
    getConversions(productId: string): Promise<ApiResponse<{
        id: string;
        tenantId: string;
        isDefault: boolean;
        createdAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        productId: string;
        fromUnit: import("@prisma/working-client").$Enums.UnitType;
        toUnit: import("@prisma/working-client").$Enums.UnitType;
        conversionRate: import("@prisma/working-client/runtime/library").Decimal;
    }[]>>;
    convert(dto: ConvertDto): Promise<ApiResponse<{
        quantity: number;
        unit: string;
        conversionRate: number;
    }>>;
    getTypes(): Promise<ApiResponse<{
        value: string;
        label: string;
    }[]>>;
    removeConversion(conversionId: string): Promise<ApiResponse<null>>;
}
