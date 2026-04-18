export declare enum StorageEntityType {
    LISTING = "listing",
    POST = "post",
    REVIEW = "review",
    OFFER = "offer"
}
export declare class PresignedUrlDto {
    entityType: StorageEntityType;
    entityId: string;
    filename: string;
    contentType: string;
    expiresIn?: number;
}
