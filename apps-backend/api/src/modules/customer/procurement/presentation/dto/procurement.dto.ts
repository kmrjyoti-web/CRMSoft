import {
  IsString, IsOptional, IsNumber, IsArray, ValidateNested,
  IsBoolean, IsInt, Min, IsEnum, IsDateString, IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ─── Unit DTOs ───

export class CreateUnitDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsString() symbol: string;
  @ApiProperty() @IsString() category: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() baseMultiplier?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isBaseUnit?: boolean;
}

export class UpdateUnitDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() symbol?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() baseMultiplier?: number;
}

export class CreateUnitConversionDto {
  @ApiProperty() @IsUUID() fromUnitId: string;
  @ApiProperty() @IsUUID() toUnitId: string;
  @ApiProperty() @IsNumber() factor: number;
  @ApiPropertyOptional() @IsOptional() @IsUUID() productId?: string;
}

export class CalculateConversionDto {
  @ApiProperty() @IsUUID() fromUnitId: string;
  @ApiProperty() @IsUUID() toUnitId: string;
  @ApiProperty() @IsNumber() quantity: number;
  @ApiPropertyOptional() @IsOptional() @IsUUID() productId?: string;
}

// ─── RFQ DTOs ───

export class CreateRFQItemDto {
  @ApiProperty() @IsUUID() productId: string;
  @ApiProperty() @IsNumber() @Min(1) quantity: number;
  @ApiPropertyOptional() @IsOptional() @IsUUID() unitId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() specifications?: string;
}

export class CreateRFQDto {
  @ApiProperty() @IsString() rfqNumber: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dueDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
  @ApiProperty({ type: [CreateRFQItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRFQItemDto)
  items: CreateRFQItemDto[];
  @ApiPropertyOptional() @IsOptional() @IsArray() @IsUUID(undefined, { each: true }) vendorIds?: string[];
}

export class UpdateRFQDto {
  @ApiPropertyOptional() @IsOptional() @IsDateString() dueDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
}

// ─── Purchase Quotation DTOs ───

export class CreatePurchaseQuotationItemDto {
  @ApiProperty() @IsUUID() rfqItemId: string;
  @ApiProperty() @IsUUID() productId: string;
  @ApiProperty() @IsNumber() @Min(1) quantity: number;
  @ApiProperty() @IsNumber() unitPrice: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() discount?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() taxRate?: number;
  @ApiPropertyOptional() @IsOptional() @IsUUID() unitId?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() deliveryDays?: number;
}

export class CreatePurchaseQuotationDto {
  @ApiProperty() @IsUUID() rfqId: string;
  @ApiProperty() @IsUUID() vendorId: string;
  @ApiProperty() @IsString() quotationNumber: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() validUntil?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() paymentTermDays?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
  @ApiProperty({ type: [CreatePurchaseQuotationItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseQuotationItemDto)
  items: CreatePurchaseQuotationItemDto[];
}

// ─── Quotation Compare DTOs ───

export class CompareQuotationsDto {
  @ApiProperty() @IsUUID() rfqId: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() priceWeight?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() deliveryWeight?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() creditWeight?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() qualityWeight?: number;
}

export class SelectWinnerDto {
  @ApiProperty() @IsUUID() comparisonId: string;
  @ApiProperty() @IsUUID() quotationId: string;
  @ApiPropertyOptional() @IsOptional() @IsString() remarks?: string;
}

// ─── Purchase Order DTOs ───

export class CreatePOItemDto {
  @ApiProperty() @IsUUID() productId: string;
  @ApiProperty() @IsNumber() @Min(1) quantity: number;
  @ApiProperty() @IsNumber() unitPrice: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() discount?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() taxRate?: number;
  @ApiPropertyOptional() @IsOptional() @IsUUID() unitId?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() expectedDeliveryDate?: string;
}

export class CreatePODto {
  @ApiProperty() @IsString() poNumber: string;
  @ApiProperty() @IsUUID() vendorId: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() quotationId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() saleOrderId?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() expectedDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() paymentTermDays?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() deliveryAddress?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
  @ApiProperty({ type: [CreatePOItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePOItemDto)
  items: CreatePOItemDto[];
}

export class UpdatePODto {
  @ApiPropertyOptional() @IsOptional() @IsDateString() expectedDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() deliveryAddress?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
}

// ─── Goods Receipt (GRN/Challan) DTOs ───

export class CreateGRNItemDto {
  @ApiProperty() @IsUUID() poItemId: string;
  @ApiProperty() @IsUUID() productId: string;
  @ApiProperty() @IsNumber() @Min(1) receivedQty: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() acceptedQty?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() rejectedQty?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() rejectionReason?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() locationId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() batchNo?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() expiryDate?: string;
}

export class CreateGRNDto {
  @ApiProperty() @IsString() grnNumber: string;
  @ApiProperty() @IsUUID() purchaseOrderId: string;
  @ApiPropertyOptional() @IsOptional() @IsString() challanNumber?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() challanDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() vehicleNumber?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() receivingLocationId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
  @ApiProperty({ type: [CreateGRNItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateGRNItemDto)
  items: CreateGRNItemDto[];
}

export class UpdateGRNDto {
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

// ─── Purchase Invoice DTOs ───

export class CreatePurchaseInvoiceItemDto {
  @ApiProperty() @IsUUID() productId: string;
  @ApiProperty() @IsNumber() @Min(1) quantity: number;
  @ApiProperty() @IsNumber() unitPrice: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() discount?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() taxRate?: number;
  @ApiPropertyOptional() @IsOptional() @IsUUID() grnItemId?: string;
}

export class CreatePurchaseInvoiceDto {
  @ApiProperty() @IsString() invoiceNumber: string;
  @ApiProperty() @IsUUID() vendorId: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() purchaseOrderId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() goodsReceiptId?: string;
  @ApiProperty() @IsString() vendorInvoiceNo: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() vendorInvoiceDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dueDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
  @ApiProperty({ type: [CreatePurchaseInvoiceItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseInvoiceItemDto)
  items: CreatePurchaseInvoiceItemDto[];
}

export class UpdatePurchaseInvoiceDto {
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

// ─── Workflow Action DTO ───

export class WorkflowActionDto {
  @ApiProperty() @IsString() action: 'submit' | 'approve' | 'reject' | 'cancel';
  @ApiPropertyOptional() @IsOptional() @IsString() remarks?: string;
}
