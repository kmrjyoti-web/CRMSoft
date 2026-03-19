import {
  IsString, IsOptional, IsDateString, IsNumber, IsEnum, IsUUID, Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod, PaymentGateway, PaymentStatus } from '@prisma/working-client';

export class RecordPaymentDto {
  @IsUUID() invoiceId: string;
  @IsNumber() @Min(0.01) amount: number;
  @IsEnum(PaymentMethod) method: PaymentMethod;
  @IsOptional() @IsEnum(PaymentGateway) gateway?: PaymentGateway;
  @IsOptional() @IsString() chequeNumber?: string;
  @IsOptional() @IsDateString() chequeDate?: string;
  @IsOptional() @IsString() chequeBankName?: string;
  @IsOptional() @IsString() transactionRef?: string;
  @IsOptional() @IsString() upiTransactionId?: string;
  @IsOptional() @IsString() notes?: string;
}

export class CreateGatewayOrderDto {
  @IsUUID() invoiceId: string;
  @IsNumber() @Min(0.01) amount: number;
  @IsEnum(PaymentGateway) gateway: PaymentGateway;
}

export class VerifyGatewayPaymentDto {
  @IsString() gatewayOrderId: string;
  @IsString() gatewayPaymentId: string;
  @IsString() gatewaySignature: string;
}

export class PaymentQueryDto {
  @IsOptional() @IsString() invoiceId?: string;
  @IsOptional() @IsEnum(PaymentStatus) status?: PaymentStatus;
  @IsOptional() @IsDateString() fromDate?: string;
  @IsOptional() @IsDateString() toDate?: string;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(1) page?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(1) limit?: number;
}
