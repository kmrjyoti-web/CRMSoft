export declare class GetEffectivePriceQuery {
    readonly productId: string;
    readonly contactId?: string | undefined;
    readonly organizationId?: string | undefined;
    readonly quantity: number;
    readonly isInterState: boolean;
    constructor(productId: string, contactId?: string | undefined, organizationId?: string | undefined, quantity?: number, isInterState?: boolean);
}
