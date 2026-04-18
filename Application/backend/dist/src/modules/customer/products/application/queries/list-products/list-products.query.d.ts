export declare class ListProductsQuery {
    readonly page: number;
    readonly limit: number;
    readonly sortBy: string;
    readonly sortDir: 'asc' | 'desc';
    readonly search?: string | undefined;
    readonly status?: string | undefined;
    readonly parentId?: string | undefined;
    readonly isMaster?: boolean | undefined;
    readonly brandId?: string | undefined;
    readonly manufacturerId?: string | undefined;
    readonly minPrice?: number | undefined;
    readonly maxPrice?: number | undefined;
    readonly taxType?: string | undefined;
    readonly licenseRequired?: boolean | undefined;
    readonly tags?: string | undefined;
    constructor(page: number, limit: number, sortBy: string, sortDir: 'asc' | 'desc', search?: string | undefined, status?: string | undefined, parentId?: string | undefined, isMaster?: boolean | undefined, brandId?: string | undefined, manufacturerId?: string | undefined, minPrice?: number | undefined, maxPrice?: number | undefined, taxType?: string | undefined, licenseRequired?: boolean | undefined, tags?: string | undefined);
}
