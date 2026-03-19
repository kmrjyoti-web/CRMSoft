import {
  IsString, IsOptional, IsDateString, IsArray, IsBoolean,
  IsEnum, IsNumber, ValidateNested, IsUUID, Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { InvoiceStatus } from '@prisma/working-client';

export class InvoiceLineItemDto {
  @IsOptional() @IsString() productId?: string;
  @IsOptional() @IsString() productCode?: string;
  @IsString() productName: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() hsnCode?: string;
  @IsNumber() quantity: number;
  @IsOptional() @IsString() unit?: string;
  @IsNumber() unitPrice: number;
  @IsOptional() @IsNumber() mrp?: number;
  @IsOptional() @IsString() discountType?: string;
  @IsOptional() @IsNumber() discountValue?: number;
  @IsOptional() @IsNumber() gstRate?: number;
  @IsOptional() @IsNumber() cessRate?: number;
  @IsOptional() @IsNumber() sortOrder?: number;
  @IsOptional() @IsString() notes?: string;
}

export class CreateInvoiceDto {
  @IsOptional() @IsString() quotationId?: string;
  @IsOptional() @IsString() leadId?: string;
  @IsOptional() @IsString() contactId?: string;
  @IsOptional() @IsString() organizationId?: string;

  @IsString() billingName: string;
  @IsOptional() @IsString() billingAddress?: string;
  @IsOptional() @IsString() billingCity?: string;
  @IsOptional() @IsString() billingState?: string;
  @IsOptional() @IsString() billingPincode?: string;
  @IsOptional() @IsString() billingGstNumber?: string;

  @IsOptional() @IsString() shippingName?: string;
  @IsOptional() @IsString() shippingAddress?: string;
  @IsOptional() @IsString() shippingCity?: string;
  @IsOptional() @IsString() shippingState?: string;
  @IsOptional() @IsString() shippingPincode?: string;

  @IsDateString() dueDate: string;
  @IsOptional() @IsDateString() invoiceDate?: string;
  @IsOptional() @IsDateString() supplyDate?: string;

  @IsOptional() @IsString() discountType?: string;
  @IsOptional() @IsNumber() discountValue?: number;
  @IsOptional() @IsBoolean() isInterState?: boolean;

  @IsArray() @ValidateNested({ each: true }) @Type(() => InvoiceLineItemDto)
  lineItems: InvoiceLineItemDto[];

  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() termsAndConditions?: string;
  @IsOptional() @IsString() internalNotes?: string;
}

export class UpdateInvoiceDto {
  @IsOptional() @IsString() billingName?: string;
  @IsOptional() @IsString() billingAddress?: string;
  @IsOptional() @IsString() billingCity?: string;
  @IsOptional() @IsString() billingState?: string;
  @IsOptional() @IsString() billingPincode?: string;
  @IsOptional() @IsString() billingGstNumber?: string;
  @IsOptional() @IsString() shippingName?: string;
  @IsOptional() @IsString() shippingAddress?: string;
  @IsOptional() @IsString() shippingCity?: string;
  @IsOptional() @IsString() shippingState?: string;
  @IsOptional() @IsString() shippingPincode?: string;
  @IsOptional() @IsDateString() dueDate?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() termsAndConditions?: string;
  @IsOptional() @IsString() internalNotes?: string;
}

export class InvoiceQueryDto {
  @IsOptional() @IsEnum(InvoiceStatus) status?: InvoiceStatus;
  @IsOptional() @IsString() contactId?: string;
  @IsOptional() @IsString() organizationId?: string;
  @IsOptional() @IsDateString() fromDate?: string;
  @IsOptional() @IsDateString() toDate?: string;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(1) page?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(1) limit?: number;
}

export class GenerateInvoiceDto {
  @IsUUID() quotationId: string;
  @IsDateString() dueDate: string;
  @IsOptional() @IsBoolean() isInterState?: boolean;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() termsAndConditions?: string;
}

export class CancelInvoiceDto {
  @IsString() reason: string;
}
