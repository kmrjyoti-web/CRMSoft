export interface TaxBreakup {
    taxType: string;
    gstRate: number;
    cgst: {
        rate: number;
        amount: number;
    } | null;
    sgst: {
        rate: number;
        amount: number;
    } | null;
    igst: {
        rate: number;
        amount: number;
    } | null;
    cess: {
        rate: number;
        amount: number;
    };
    totalTax: number;
}
export interface TaxInput {
    basePrice: number;
    gstRate: number;
    cessRate: number;
    taxType: string;
    taxInclusive: boolean;
    isInterState: boolean;
    quantity: number;
}
export declare function toNum(val: any): number;
export declare function round(val: number): number;
export declare function calculateTax(input: TaxInput): {
    baseAmount: number;
    totalTax: number;
    unitTotal: number;
    tax: TaxBreakup;
};
