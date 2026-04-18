export declare class ManageProductImagesCommand {
    readonly productId: string;
    readonly images: Record<string, unknown>[];
    constructor(productId: string, images: Record<string, unknown>[]);
}
