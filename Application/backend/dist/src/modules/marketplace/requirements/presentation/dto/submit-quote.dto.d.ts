export declare class SubmitQuoteDto {
    pricePerUnit: number;
    quantity: number;
    deliveryDays: number;
    creditDays?: number;
    notes?: string;
    certifications?: string[];
}
