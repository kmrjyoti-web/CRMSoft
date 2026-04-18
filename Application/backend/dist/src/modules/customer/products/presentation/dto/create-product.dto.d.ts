export declare enum TaxTypeEnum {
    GST = "GST",
    IGST = "IGST",
    EXEMPT = "EXEMPT",
    ZERO_RATED = "ZERO_RATED",
    COMPOSITE = "COMPOSITE"
}
export declare enum UnitTypeEnum {
    PIECE = "PIECE",
    BOX = "BOX",
    PACK = "PACK",
    CARTON = "CARTON",
    KG = "KG",
    GRAM = "GRAM",
    LITRE = "LITRE",
    ML = "ML",
    METER = "METER",
    CM = "CM",
    SQ_FT = "SQ_FT",
    SQ_METER = "SQ_METER",
    DOZEN = "DOZEN",
    SET = "SET",
    PAIR = "PAIR"
}
export declare class CreateProductDto {
    name: string;
    code?: string;
    shortDescription?: string;
    description?: string;
    parentId?: string;
    isMaster?: boolean;
    image?: string;
    brochureUrl?: string;
    videoUrl?: string;
    mrp?: number;
    salePrice?: number;
    purchasePrice?: number;
    costPrice?: number;
    taxType?: TaxTypeEnum;
    hsnCode?: string;
    gstRate?: number;
    cessRate?: number;
    taxInclusive?: boolean;
    primaryUnit?: UnitTypeEnum;
    secondaryUnit?: UnitTypeEnum;
    conversionFactor?: number;
    minOrderQty?: number;
    maxOrderQty?: number;
    weight?: number;
    packingSize?: number;
    packingUnit?: UnitTypeEnum;
    packingDescription?: string;
    barcode?: string;
    batchTracking?: boolean;
    licenseRequired?: boolean;
    licenseType?: string;
    licenseNumber?: string;
    individualSale?: boolean;
    isReturnable?: boolean;
    warrantyMonths?: number;
    shelfLifeDays?: number;
    brandId?: string;
    manufacturerId?: string;
    inventoryType?: string;
    tags?: string[];
    sortOrder?: number;
}
