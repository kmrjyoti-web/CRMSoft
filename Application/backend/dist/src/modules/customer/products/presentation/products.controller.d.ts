import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { LinkProductsDto } from './dto/link-products.dto';
import { PrismaService } from '../../../../core/prisma/prisma.service';
export declare class ProductsController {
    private readonly commandBus;
    private readonly queryBus;
    private readonly prisma;
    constructor(commandBus: CommandBus, queryBus: QueryBus, prisma: PrismaService);
    create(dto: CreateProductDto, userId: string): Promise<ApiResponse<any>>;
    findAll(q: ProductQueryDto): Promise<ApiResponse<unknown[]>>;
    getTree(): Promise<ApiResponse<any>>;
    quickSearch(q: string): Promise<ApiResponse<{
        id: string;
        name: string;
        code: string;
        status: import("@prisma/working-client").$Enums.ProductStatus;
        slug: string;
        image: string | null;
        salePrice: import("@prisma/working-client/runtime/library").Decimal | null;
    }[]>>;
    findById(id: string): Promise<ApiResponse<any>>;
    update(id: string, dto: UpdateProductDto): Promise<ApiResponse<any>>;
    deactivate(id: string): Promise<ApiResponse<any>>;
    manageImages(id: string, images: Record<string, unknown>[]): Promise<ApiResponse<any>>;
    linkProduct(id: string, dto: LinkProductsDto): Promise<ApiResponse<any>>;
    unlinkProduct(relationId: string): Promise<ApiResponse<null>>;
    getRelations(id: string): Promise<ApiResponse<({
        fromProduct: {
            id: string;
            name: string;
            code: string;
            image: string | null;
        };
        toProduct: {
            id: string;
            name: string;
            code: string;
            image: string | null;
        };
    } & {
        id: string;
        tenantId: string;
        isActive: boolean;
        createdAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        sortOrder: number;
        relationType: string;
        toProductId: string;
        fromProductId: string;
    })[]>>;
    assignFilters(id: string, ids: string[]): Promise<ApiResponse<any>>;
    getFilters(id: string): Promise<ApiResponse<{
        id: string;
        tenantId: string;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        productId: string;
        lookupValueId: string;
    }[]>>;
    replaceFilters(id: string, ids: string[]): Promise<ApiResponse<any>>;
    getPricing(id: string): Promise<ApiResponse<any>>;
}
