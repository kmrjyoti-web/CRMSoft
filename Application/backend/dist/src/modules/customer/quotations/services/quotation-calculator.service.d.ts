import { PrismaService } from '../../../../core/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
export interface LineItemInput {
    quantity: number;
    unitPrice: number;
    discountType?: string;
    discountValue?: number;
    gstRate?: number;
    cessRate?: number;
    isOptional?: boolean;
}
export interface CalculatedLineItem {
    discountAmount: number;
    lineTotal: number;
    cgstAmount: number;
    sgstAmount: number;
    igstAmount: number;
    cessAmount: number;
    taxAmount: number;
    totalWithTax: number;
}
export interface QuotationTotals {
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
}
export declare class QuotationCalculatorService {
    private readonly prisma;
    private readonly config;
    private companyState;
    constructor(prisma: PrismaService, config: ConfigService);
    isInterState(customerState?: string): boolean;
    calculateLineItem(item: LineItemInput, interState: boolean): CalculatedLineItem;
    recalculate(quotationId: string, customerState?: string, tenantId?: string): Promise<QuotationTotals>;
}
