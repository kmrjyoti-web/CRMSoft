export declare enum PostTypeEnum {
    TEXT = "TEXT",
    IMAGE = "IMAGE",
    VIDEO = "VIDEO",
    PRODUCT_SHARE = "PRODUCT_SHARE",
    CUSTOMER_FEEDBACK = "CUSTOMER_FEEDBACK",
    PRODUCT_LAUNCH = "PRODUCT_LAUNCH",
    POLL = "POLL",
    ANNOUNCEMENT = "ANNOUNCEMENT"
}
export declare enum VisibilityEnum {
    PUBLIC = "PUBLIC",
    GEO_TARGETED = "GEO_TARGETED",
    VERIFIED_ONLY = "VERIFIED_ONLY",
    MY_CONTACTS = "MY_CONTACTS",
    SELECTED_CONTACTS = "SELECTED_CONTACTS",
    CATEGORY_BASED = "CATEGORY_BASED",
    GRADE_BASED = "GRADE_BASED"
}
export declare class CreatePostDto {
    postType: PostTypeEnum;
    content?: string;
    mediaUrls?: string[];
    linkedListingId?: string;
    linkedOfferId?: string;
    rating?: number;
    productId?: string;
    visibility?: VisibilityEnum;
    visibilityConfig?: Record<string, unknown>;
    publishAt?: string;
    expiresAt?: string;
    hashtags?: string[];
    mentions?: string[];
    pollConfig?: Record<string, unknown>;
}
