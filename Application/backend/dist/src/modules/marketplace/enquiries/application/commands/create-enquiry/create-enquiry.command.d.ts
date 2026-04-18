export declare class CreateEnquiryCommand {
    readonly tenantId: string;
    readonly listingId: string;
    readonly enquirerId: string;
    readonly message: string;
    readonly quantity?: number | undefined;
    readonly expectedPrice?: number | undefined;
    readonly deliveryPincode?: string | undefined;
    constructor(tenantId: string, listingId: string, enquirerId: string, message: string, quantity?: number | undefined, expectedPrice?: number | undefined, deliveryPincode?: string | undefined);
}
