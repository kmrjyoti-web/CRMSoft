import { PrismaService } from '../../../../core/prisma/prisma.service';
import { ApiResponse } from '../../../../common/utils/api-response';
import { ProductTaxGstCalculatorService } from '../services/gst-calculator.service';
import { SetTaxDetailsDto, CalculateGstDto } from './dto/product-tax.dto';
export declare class ProductTaxController {
    private readonly prisma;
    private readonly gstCalculator;
    constructor(prisma: PrismaService, gstCalculator: ProductTaxGstCalculatorService);
    setTaxDetails(productId: string, dto: SetTaxDetailsDto): Promise<ApiResponse<{
        id: string;
        tenantId: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        productId: string;
        taxRate: import("@prisma/working-client/runtime/library").Decimal;
        taxName: string;
    }[]>>;
    getTaxDetails(productId: string): Promise<ApiResponse<{
        id: string;
        tenantId: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        productId: string;
        taxRate: import("@prisma/working-client/runtime/library").Decimal;
        taxName: string;
    }[]>>;
    calculateGst(dto: CalculateGstDto): Promise<ApiResponse<import("./dto/product-tax.dto").GSTBreakup>>;
    hsnLookup(code: string): Promise<ApiResponse<{
        hsnCode: string;
        suggestedRate: number;
        description: string;
    }>>;
}
