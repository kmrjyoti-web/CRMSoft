export declare class LogNegotiationDto {
    negotiationType: string;
    customerRequirement?: string;
    customerBudget?: number;
    customerPriceExpected?: number;
    ourPrice?: number;
    proposedDiscount?: number;
    counterOfferAmount?: number;
    itemsAdded?: Record<string, unknown>;
    itemsRemoved?: Record<string, unknown>;
    itemsModified?: Record<string, unknown>;
    termsChanged?: string;
    note?: string;
    outcome?: string;
    contactPersonId?: string;
    contactPersonName?: string;
}
