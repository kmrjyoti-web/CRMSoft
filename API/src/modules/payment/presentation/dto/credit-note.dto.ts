import { IsString, IsNumber, IsUUID, Min, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { CreditNoteStatus } from '@prisma/client';

export class CreateCreditNoteDto {
  @IsUUID() invoiceId: string;
  @IsNumber() @Min(0.01) amount: number;
  @IsString() reason: string;
}

export class ApplyCreditNoteDto {
  @IsUUID() applyToInvoiceId: string;
  @IsOptional() @IsNumber() @Min(0.01) amount?: number;
}

export class CreditNoteQueryDto {
  @IsOptional() @IsString() invoiceId?: string;
  @IsOptional() @IsEnum(CreditNoteStatus) status?: CreditNoteStatus;
  @IsOptional() @IsDateString() fromDate?: string;
  @IsOptional() @IsDateString() toDate?: string;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(1) page?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(1) limit?: number;
}
