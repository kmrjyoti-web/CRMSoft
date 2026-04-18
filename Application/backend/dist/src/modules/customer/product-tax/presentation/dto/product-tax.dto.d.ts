declare class TaxDetailItem {
    taxName: string;
    taxRate: number;
    description?: string;
}
export declare class SetTaxDetailsDto {
    taxes: TaxDetailItem[];
}
export declare class CalculateGstDto {
    amount: number;
    gstRate: number;
    cessRate?: number;
    isInterState: boolean;
    taxInclusive: boolean;
}
export interface TaxComponent {
    rate: number;
    amount: number;
}
export interface GSTBreakup {
    baseAmount: number;
    gstRate: number;
    isInterState: boolean;
    cgst: TaxComponent | null;
    sgst: TaxComponent | null;
    igst: TaxComponent | null;
    cess: TaxComponent;
    totalTax: number;
    grandTotal: number;
}
export {};
