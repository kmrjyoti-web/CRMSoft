import { IsString, IsOptional, IsNumber, IsArray, ValidateNested, IsEnum, IsBoolean, IsInt, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ─── Serial DTOs ───

export class CreateSerialDto {
  @ApiProperty() @IsString() productId: string;
  @ApiProperty() @IsString() serialNo: string;
  @ApiPropertyOptional() @IsOptional() @IsString() code1?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() code2?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() batchNo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() expiryType?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() expiryValue?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() expiryDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() mrp?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() purchaseRate?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() saleRate?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() costPrice?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() taxType?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() taxRate?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() hsnCode?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() locationId?: string;
  @ApiPropertyOptional() @IsOptional() customFields?: Record<string, unknown>;
  @ApiPropertyOptional() @IsOptional() @IsString() industryCode?: string;
}

export class BulkCreateSerialDto {
  @ApiProperty({ type: [CreateSerialDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSerialDto)
  items: CreateSerialDto[];
}

export class UpdateSerialDto {
  @ApiPropertyOptional() @IsOptional() @IsString() code1?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() code2?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() batchNo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() expiryType?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() expiryValue?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() expiryDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() mrp?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() purchaseRate?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() saleRate?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() costPrice?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() taxType?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() taxRate?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() hsnCode?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() locationId?: string;
  @ApiPropertyOptional() @IsOptional() customFields?: Record<string, unknown>;
  @ApiPropertyOptional() @IsOptional() metadata?: Record<string, unknown>;
}

export class ChangeStatusDto {
  @ApiProperty() @IsString() status: string;
  @ApiPropertyOptional() @IsOptional() @IsString() customerId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() invoiceId?: string;
}

// ─── Transaction DTOs ───

export class RecordTransactionDto {
  @ApiProperty() @IsString() productId: string;
  @ApiProperty() @IsString() transactionType: string;
  @ApiProperty() @IsInt() @Min(1) quantity: number;
  @ApiProperty() @IsString() locationId: string;
  @ApiPropertyOptional() @IsOptional() @IsString() toLocationId?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() unitPrice?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() serialMasterId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() batchId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() referenceType?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() referenceId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() remarks?: string;
}

export class TransferDto {
  @ApiProperty() @IsString() productId: string;
  @ApiProperty() @IsInt() @Min(1) quantity: number;
  @ApiProperty() @IsString() fromLocationId: string;
  @ApiProperty() @IsString() toLocationId: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() unitPrice?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() remarks?: string;
}

// ─── Location DTOs ───

export class CreateLocationDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsString() code: string;
  @ApiPropertyOptional() @IsOptional() @IsString() type?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() address?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() city?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() state?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() pincode?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() contactPerson?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isDefault?: boolean;
}

export class UpdateLocationDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() type?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() address?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() city?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() state?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() pincode?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() contactPerson?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isDefault?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
}

// ─── Adjustment DTOs ───

export class CreateAdjustmentDto {
  @ApiProperty() @IsString() productId: string;
  @ApiProperty() @IsString() locationId: string;
  @ApiProperty() @IsString() adjustmentType: string;
  @ApiProperty() @IsInt() @Min(1) quantity: number;
  @ApiProperty() @IsString() reason: string;
}

export class ApproveAdjustmentDto {
  @ApiProperty() @IsString() action: 'approve' | 'reject';
}

// ─── Label DTOs ───

export class UpsertLabelDto {
  @ApiProperty() @IsString() industryCode: string;
  @ApiPropertyOptional() @IsOptional() @IsString() serialNoLabel?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() code1Label?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() code2Label?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() expiryLabel?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() stockInLabel?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() stockOutLabel?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() locationLabel?: string;
}
