import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiResponse } from '../../../../common/utils/api-response';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { SetPricesDto, SetSlabPricesDto, BulkPriceUpdateDto } from './dto/set-prices.dto';
import { GetEffectivePriceDto } from './dto/get-effective-price.dto';
export declare class ProductPricingController {
    private readonly commandBus;
    private readonly queryBus;
    private readonly prisma;
    constructor(commandBus: CommandBus, queryBus: QueryBus, prisma: PrismaService);
    setPrices(productId: string, dto: SetPricesDto): Promise<ApiResponse<any>>;
    setGroupPrice(productId: string, body: {
        priceGroupId: string;
        priceType: string;
        amount: number;
    }): Promise<ApiResponse<any>>;
    setSlabPrices(productId: string, dto: SetSlabPricesDto): Promise<ApiResponse<any>>;
    getPriceList(productId: string): Promise<ApiResponse<any>>;
    getEffectivePrice(dto: GetEffectivePriceDto): Promise<ApiResponse<any>>;
    getProductPrices(productId: string, priceType?: string, groupId?: string): Promise<ApiResponse<any>>;
    bulkUpdate(dto: BulkPriceUpdateDto): Promise<ApiResponse<any[]>>;
    comparePrices(productIds: string): Promise<ApiResponse<{
        productId: string;
        productName: string;
        productCode: string;
        mrp: import("@prisma/working-client/runtime/library").Decimal | null;
        salePrice: import("@prisma/working-client/runtime/library").Decimal | null;
        prices: any[];
    }[]>>;
    removePrice(priceId: string): Promise<ApiResponse<null>>;
}
