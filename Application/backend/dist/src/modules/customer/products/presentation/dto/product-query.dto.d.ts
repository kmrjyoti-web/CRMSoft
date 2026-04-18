import { TaxTypeEnum } from './create-product.dto';
export declare class ProductQueryDto {
    search?: string;
    status?: string;
    parentId?: string;
    isMaster?: boolean;
    brandId?: string;
    manufacturerId?: string;
    minPrice?: number;
    maxPrice?: number;
    taxType?: TaxTypeEnum;
    licenseRequired?: boolean;
    tags?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
}
