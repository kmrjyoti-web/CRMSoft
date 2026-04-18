export interface GstLineInput {
    quantity: number;
    unitPrice: number;
    discountType?: string;
    discountValue?: number;
    gstRate?: number;
    cessRate?: number;
}
export interface GstLineResult {
    lineTotal: number;
    discountAmount: number;
    taxableAmount: number;
    cgstAmount: number;
    sgstAmount: number;
    igstAmount: number;
    cessAmount: number;
    taxAmount: number;
    totalWithTax: number;
}
export interface GstSummary {
    subtotal: number;
    discountAmount: number;
    taxableAmount: number;
    cgstAmount: number;
    sgstAmount: number;
    igstAmount: number;
    cessAmount: number;
    totalTax: number;
    roundOff: number;
    totalAmount: number;
    lines: GstLineResult[];
}
export declare class GstCalculatorService {
    calculate(lines: GstLineInput[], isInterState: boolean, overallDiscountType?: string, overallDiscountValue?: number): GstSummary;
    isInterState(sellerGst: string | null, buyerGst: string | null): boolean;
    isInterStateByName(sellerState: string | null, buyerState: string | null): boolean;
    private round;
}
