import { GSTBreakup } from '../presentation/dto/product-tax.dto';
export declare class ProductTaxGstCalculatorService {
    calculateGST(params: {
        amount: number;
        gstRate: number;
        cessRate?: number;
        isInterState: boolean;
        taxInclusive: boolean;
    }): GSTBreakup;
    private round;
}
