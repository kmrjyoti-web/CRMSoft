import { IsString, IsNumber, IsOptional, IsBoolean, IsDateString, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

// Sale Order
class SaleOrderItemDto {
  @IsString() productId: string;
  @IsNumber() orderedQty: number;
  @IsString() unitId: string;
  @IsNumber() unitPrice: number;
  @IsOptional() @IsNumber() discount?: number;
  @IsOptional() @IsNumber() taxRate?: number;
  @IsOptional() @IsString() taxType?: string;
  @IsOptional() @IsString() hsnCode?: string;
}

export class CreateSaleOrderDto {
  @IsOptional() @IsString() quotationId?: string;
  @IsString() customerId: string;
  @IsString() customerType: string;
  @IsOptional() @IsDateString() expectedDeliveryDate?: string;
  @IsOptional() @IsString() deliveryLocationId?: string;
  @IsOptional() @IsNumber() creditDays?: number;
  @IsOptional() @IsString() paymentTerms?: string;
  @IsOptional() @IsString() remarks?: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => SaleOrderItemDto)
  items: SaleOrderItemDto[];
}

export class UpdateSaleOrderDto {
  @IsOptional() @IsDateString() expectedDeliveryDate?: string;
  @IsOptional() @IsString() deliveryLocationId?: string;
  @IsOptional() @IsNumber() creditDays?: number;
  @IsOptional() @IsString() paymentTerms?: string;
  @IsOptional() @IsString() remarks?: string;
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => SaleOrderItemDto)
  items?: SaleOrderItemDto[];
}

// Delivery Challan
class DeliveryChallanItemDto {
  @IsString() productId: string;
  @IsOptional() @IsString() saleOrderItemId?: string;
  @IsNumber() quantity: number;
  @IsString() unitId: string;
  @IsOptional() @IsNumber() unitPrice?: number;
  @IsOptional() @IsString() batchNo?: string;
  @IsOptional() serialNos?: string[];
  @IsOptional() @IsString() fromLocationId?: string;
}

export class CreateDeliveryChallanDto {
  @IsOptional() @IsString() saleOrderId?: string;
  @IsString() customerId: string;
  @IsString() customerType: string;
  @IsString() fromLocationId: string;
  @IsOptional() @IsString() transporterName?: string;
  @IsOptional() @IsString() vehicleNumber?: string;
  @IsOptional() @IsString() lrNumber?: string;
  @IsOptional() @IsString() ewayBillNumber?: string;
  @IsOptional() @IsDateString() ewayBillDate?: string;
  @IsOptional() @IsString() remarks?: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => DeliveryChallanItemDto)
  items: DeliveryChallanItemDto[];
}

// Sale Return
class SaleReturnItemDto {
  @IsString() productId: string;
  @IsNumber() returnedQty: number;
  @IsString() unitId: string;
  @IsNumber() unitPrice: number;
  @IsOptional() @IsNumber() taxRate?: number;
  @IsOptional() @IsString() hsnCode?: string;
  @IsOptional() @IsString() returnReason?: string;
  @IsOptional() @IsString() condition?: string;
  @IsOptional() @IsString() batchNo?: string;
  @IsOptional() serialNos?: string[];
}

export class CreateSaleReturnDto {
  @IsString() customerId: string;
  @IsString() customerType: string;
  @IsOptional() @IsString() saleOrderId?: string;
  @IsOptional() @IsString() invoiceId?: string;
  @IsString() returnReason: string;
  @IsOptional() @IsString() receiveLocationId?: string;
  @IsOptional() @IsString() remarks?: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => SaleReturnItemDto)
  items: SaleReturnItemDto[];
}

export class InspectReturnDto {
  @IsArray() inspections: Array<{ itemId: string; acceptedQty: number; rejectedQty: number; condition?: string }>;
}

// Credit Note (enhanced, manual creation)
export class CreateCreditNoteDto {
  @IsString() customerId: string;
  @IsString() customerType: string;
  @IsOptional() @IsString() invoiceId?: string;
  @IsOptional() @IsString() saleReturnId?: string;
  @IsString() reason: string;
  @IsArray() items: Array<{
    productId: string; quantity: number; unitId: string; unitPrice: number;
    taxableAmount: number; cgstAmount?: number; sgstAmount?: number; igstAmount?: number; hsnCode?: string;
  }>;
}

// Debit Note
export class CreateDebitNoteDto {
  @IsString() vendorId: string;
  @IsOptional() @IsString() purchaseInvoiceId?: string;
  @IsOptional() @IsString() goodsReceiptId?: string;
  @IsString() reason: string;
  @IsOptional() @IsBoolean() inventoryEffect?: boolean;
  @IsOptional() @IsBoolean() accountsEffect?: boolean;
  @IsArray() items: Array<{
    productId: string; quantity: number; unitId: string; unitPrice: number;
    taxableAmount: number; cgstAmount?: number; sgstAmount?: number; igstAmount?: number; hsnCode?: string;
  }>;
}

export class AdjustNoteDto {
  @IsOptional() @IsString() invoiceId?: string;
  @IsOptional() @IsBoolean() issueRefund?: boolean;
}
