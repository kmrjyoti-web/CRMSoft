export declare class RedeemOfferCommand {
    readonly offerId: string;
    readonly tenantId: string;
    readonly userId: string;
    readonly orderId?: string | undefined;
    readonly orderValue?: number | undefined;
    readonly quantity?: number | undefined;
    readonly productId?: string | undefined;
    readonly categoryId?: string | undefined;
    readonly city?: string | undefined;
    readonly state?: string | undefined;
    readonly pincode?: string | undefined;
    readonly deviceType?: string | undefined;
    readonly grade?: string | undefined;
    readonly groupId?: string | undefined;
    readonly isVerified?: boolean | undefined;
    constructor(offerId: string, tenantId: string, userId: string, orderId?: string | undefined, orderValue?: number | undefined, quantity?: number | undefined, productId?: string | undefined, categoryId?: string | undefined, city?: string | undefined, state?: string | undefined, pincode?: string | undefined, deviceType?: string | undefined, grade?: string | undefined, groupId?: string | undefined, isVerified?: boolean | undefined);
}
