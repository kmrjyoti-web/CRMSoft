export declare class SubmitQuoteCommand {
    readonly requirementId: string;
    readonly sellerId: string;
    readonly tenantId: string;
    readonly pricePerUnit: number;
    readonly quantity: number;
    readonly deliveryDays: number;
    readonly creditDays?: number | undefined;
    readonly notes?: string | undefined;
    readonly certifications?: string[] | undefined;
    constructor(requirementId: string, sellerId: string, tenantId: string, pricePerUnit: number, quantity: number, deliveryDays: number, creditDays?: number | undefined, notes?: string | undefined, certifications?: string[] | undefined);
}
