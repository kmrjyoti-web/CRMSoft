export declare class LogNegotiationCommand {
    readonly quotationId: string;
    readonly userId: string;
    readonly userName: string;
    readonly negotiationType: string;
    readonly customerRequirement?: string | undefined;
    readonly customerBudget?: number | undefined;
    readonly customerPriceExpected?: number | undefined;
    readonly ourPrice?: number | undefined;
    readonly proposedDiscount?: number | undefined;
    readonly counterOfferAmount?: number | undefined;
    readonly itemsAdded?: Record<string, unknown> | undefined;
    readonly itemsRemoved?: Record<string, unknown> | undefined;
    readonly itemsModified?: Record<string, unknown> | undefined;
    readonly termsChanged?: string | undefined;
    readonly note?: string | undefined;
    readonly outcome?: string | undefined;
    readonly contactPersonId?: string | undefined;
    readonly contactPersonName?: string | undefined;
    constructor(quotationId: string, userId: string, userName: string, negotiationType: string, customerRequirement?: string | undefined, customerBudget?: number | undefined, customerPriceExpected?: number | undefined, ourPrice?: number | undefined, proposedDiscount?: number | undefined, counterOfferAmount?: number | undefined, itemsAdded?: Record<string, unknown> | undefined, itemsRemoved?: Record<string, unknown> | undefined, itemsModified?: Record<string, unknown> | undefined, termsChanged?: string | undefined, note?: string | undefined, outcome?: string | undefined, contactPersonId?: string | undefined, contactPersonName?: string | undefined);
}
