export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED';
export interface ReviewProps {
    id: string;
    tenantId: string;
    listingId: string;
    reviewerId: string;
    rating: number;
    title?: string;
    body?: string;
    mediaUrls?: string[];
    isVerifiedPurchase?: boolean;
    orderId?: string;
    status?: ReviewStatus;
}
export declare class ReviewEntity {
    readonly id: string;
    readonly tenantId: string;
    readonly listingId: string;
    readonly reviewerId: string;
    rating: number;
    title?: string;
    body?: string;
    mediaUrls?: string[];
    isVerifiedPurchase: boolean;
    orderId?: string;
    status: ReviewStatus;
    moderatorId?: string;
    moderationNote?: string;
    helpfulCount: number;
    reportCount: number;
    sellerResponse?: string;
    sellerRespondedAt?: Date;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
    private constructor();
    static create(props: ReviewProps): ReviewEntity;
    approve(moderatorId: string, note?: string): void;
    reject(moderatorId: string, note: string): void;
    flag(moderatorId: string, note: string): void;
    isApproved(): boolean;
}
