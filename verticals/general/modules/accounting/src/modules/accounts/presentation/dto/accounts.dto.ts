import { IsString, IsNumber, IsOptional, IsBoolean, IsDateString, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

// ─── Payment ───
export class CreatePaymentDto {
  @IsString() paymentType: string; // PAYMENT_OUT or RECEIPT_IN
  @IsString() entityType: string;
  @IsString() entityId: string;
  @IsOptional() @IsString() entityName?: string;
  @IsOptional() @IsString() referenceType?: string;
  @IsOptional() @IsString() referenceId?: string;
  @IsNumber() @Min(0.01) amount: number;
  @IsString() paymentMode: string;
  @IsOptional() @IsString() bankAccountId?: string;
  @IsOptional() @IsString() chequeNumber?: string;
  @IsOptional() @IsDateString() chequeDate?: string;
  @IsOptional() @IsString() transactionRef?: string;
  @IsOptional() @IsString() upiId?: string;
  @IsOptional() @IsBoolean() tdsApplicable?: boolean;
  @IsOptional() @IsNumber() tdsRate?: number;
  @IsOptional() @IsString() tdsSection?: string;
  @IsDateString() paymentDate: string;
  @IsOptional() @IsString() narration?: string;
}

export class ApprovePaymentDto {
  @IsOptional() @IsString() remarks?: string;
}

export class BulkPaymentDto {
  @IsString() entityId: string;
  @IsString() entityType: string;
  invoiceIds: string[];
  @IsNumber() totalAmount: number;
  @IsString() paymentMode: string;
  @IsOptional() @IsString() bankAccountId?: string;
  @IsDateString() paymentDate: string;
}

// ─── Bank Account ───
export class CreateBankAccountDto {
  @IsString() bankName: string;
  @IsString() accountNumber: string;
  @IsString() accountType: string;
  @IsString() ifscCode: string;
  @IsOptional() @IsString() branchName?: string;
  @IsOptional() @IsString() ledgerId?: string;
  @IsOptional() @IsNumber() openingBalance?: number;
  @IsOptional() @IsBoolean() isDefault?: boolean;
}

// ─── Bank Reconciliation ───
export class SubmitReconciliationDto {
  @IsString() bankAccountId: string;
  @IsDateString() reconciliationDate: string;
  @IsNumber() statementBalance: number;
}

// ─── GST ───
export class GenerateGSTDto {
  @IsString() period: string; // "2026-03"
}

export class FileGSTDto {
  @IsOptional() @IsString() acknowledgementNo?: string;
}

// ─── TDS ───
export class DepositTDSDto {
  @IsDateString() depositDate: string;
  @IsOptional() @IsString() challanNumber?: string;
}

// ─── Journal Entry ───
export class CreateJournalEntryDto {
  @IsDateString() transactionDate: string;
  @IsString() debitLedgerId: string;
  @IsString() creditLedgerId: string;
  @IsNumber() @Min(0.01) amount: number;
  @IsOptional() @IsString() narration?: string;
  @IsOptional() @IsString() referenceType?: string;
  @IsOptional() @IsString() referenceId?: string;
}

// ─── Ledger (basic) ───
export class CreateLedgerDto {
  @IsOptional() @IsString() code?: string;
  @IsString() name: string;
  @IsString() groupType: string;
  @IsOptional() @IsString() subGroup?: string;
  @IsOptional() @IsString() parentId?: string;
  @IsOptional() @IsNumber() openingBalance?: number;
}

// ─── Account Group ───
export class CreateAccountGroupDto {
  @IsString() name: string;
  @IsString() code: string;
  @IsString() primaryGroup: string;
  @IsOptional() @IsString() parentId?: string;
  @IsOptional() @IsString() nature?: string;
  @IsOptional() @IsBoolean() isProhibited?: boolean;
}

export class UpdateAccountGroupDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() parentId?: string;
  @IsOptional() @IsBoolean() isProhibited?: boolean;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

// ─── Sale Master ───
export class CreateSaleMasterDto {
  @IsString() name: string;
  @IsString() code: string;
  @IsOptional() @IsNumber() igstRate?: number;
  @IsOptional() @IsNumber() cgstRate?: number;
  @IsOptional() @IsNumber() sgstRate?: number;
  @IsOptional() @IsNumber() cessRate?: number;
  @IsOptional() @IsString() natureOfTransaction?: string;
  @IsOptional() @IsString() taxability?: string;
  @IsOptional() @IsString() localLedgerId?: string;
  @IsOptional() @IsString() centralLedgerId?: string;
  @IsOptional() @IsString() igstLedgerId?: string;
  @IsOptional() @IsString() cgstLedgerId?: string;
  @IsOptional() @IsString() sgstLedgerId?: string;
  @IsOptional() @IsString() cessLedgerId?: string;
  @IsOptional() @IsBoolean() isDefault?: boolean;
  @IsOptional() @IsNumber() sortOrder?: number;
}

export class UpdateSaleMasterDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsNumber() igstRate?: number;
  @IsOptional() @IsNumber() cgstRate?: number;
  @IsOptional() @IsNumber() sgstRate?: number;
  @IsOptional() @IsNumber() cessRate?: number;
  @IsOptional() @IsString() natureOfTransaction?: string;
  @IsOptional() @IsString() taxability?: string;
  @IsOptional() @IsString() localLedgerId?: string;
  @IsOptional() @IsString() centralLedgerId?: string;
  @IsOptional() @IsString() igstLedgerId?: string;
  @IsOptional() @IsString() cgstLedgerId?: string;
  @IsOptional() @IsString() sgstLedgerId?: string;
  @IsOptional() @IsString() cessLedgerId?: string;
  @IsOptional() @IsBoolean() isDefault?: boolean;
  @IsOptional() @IsNumber() sortOrder?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

// ─── Purchase Master ───
export class CreatePurchaseMasterDto {
  @IsString() name: string;
  @IsString() code: string;
  @IsOptional() @IsNumber() igstRate?: number;
  @IsOptional() @IsNumber() cgstRate?: number;
  @IsOptional() @IsNumber() sgstRate?: number;
  @IsOptional() @IsNumber() cessRate?: number;
  @IsOptional() @IsString() natureOfTransaction?: string;
  @IsOptional() @IsString() taxability?: string;
  @IsOptional() @IsString() localLedgerId?: string;
  @IsOptional() @IsString() centralLedgerId?: string;
  @IsOptional() @IsString() igstLedgerId?: string;
  @IsOptional() @IsString() cgstLedgerId?: string;
  @IsOptional() @IsString() sgstLedgerId?: string;
  @IsOptional() @IsString() cessLedgerId?: string;
  @IsOptional() @IsBoolean() isDefault?: boolean;
  @IsOptional() @IsNumber() sortOrder?: number;
}

export class UpdatePurchaseMasterDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsNumber() igstRate?: number;
  @IsOptional() @IsNumber() cgstRate?: number;
  @IsOptional() @IsNumber() sgstRate?: number;
  @IsOptional() @IsNumber() cessRate?: number;
  @IsOptional() @IsString() natureOfTransaction?: string;
  @IsOptional() @IsString() taxability?: string;
  @IsOptional() @IsString() localLedgerId?: string;
  @IsOptional() @IsString() centralLedgerId?: string;
  @IsOptional() @IsString() igstLedgerId?: string;
  @IsOptional() @IsString() cgstLedgerId?: string;
  @IsOptional() @IsString() sgstLedgerId?: string;
  @IsOptional() @IsString() cessLedgerId?: string;
  @IsOptional() @IsBoolean() isDefault?: boolean;
  @IsOptional() @IsNumber() sortOrder?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

// ─── Rich Ledger Create ───
export class CreateRichLedgerDto {
  @IsOptional() @IsString() code?: string;           // blank → auto-generate in service
  @IsString() name: string;
  @IsOptional() @IsString() groupType?: string;      // derived from accountGroupId in service
  @IsOptional() @IsString() subGroup?: string;
  @IsOptional() @IsString() parentId?: string;
  @IsOptional() @IsString() accountGroupId?: string;
  @IsOptional() @IsNumber() openingBalance?: number;
  @IsOptional() @IsString() openingBalanceType?: string;
  @IsOptional() @IsString() aliasName?: string;
  @IsOptional() @IsString() mailTo?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() country?: string;
  @IsOptional() @IsString() countryCode?: string;    // UI sends this — accepted & ignored
  @IsOptional() @IsString() state?: string;
  @IsOptional() @IsString() stateCode?: string;      // UI sends this — accepted & ignored
  @IsOptional() @IsString() gstStateCode?: string;   // UI sends this — stored/ignored
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() pincode?: string;
  @IsOptional() @IsString() station?: string;
  @IsOptional() @IsString() currency?: string;
  @IsOptional() @IsString() balancingMethod?: string;
  @IsOptional() @IsNumber() creditDays?: number;
  @IsOptional() @IsNumber() creditLimit?: number;
  @IsOptional() @IsString() phoneOffice?: string;
  @IsOptional() @IsString() mobile1?: string;
  @IsOptional() @IsString() mobile2?: string;
  @IsOptional() @IsString() whatsappNo?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() ledgerType?: string;
  @IsOptional() @IsString() panNo?: string;
  @IsOptional() @IsString() gstin?: string;
  @IsOptional() @IsBoolean() gstApplicable?: boolean;
  @IsOptional() @IsString() gstType?: string;
  @IsOptional() @IsString() bankName?: string;
  @IsOptional() @IsString() bankAccountNo?: string;
  @IsOptional() @IsString() bankIfsc?: string;
  @IsOptional() @IsString() bankBranch?: string;
}

// ─── Ledger Mapping ───
export class CreateLedgerMappingDto {
  @IsString() entityType: string;
  @IsString() entityId: string;
  @IsOptional() @IsString() entityName?: string;
  @IsString() ledgerId: string;
  @IsString() mappingType: string;
  @IsOptional() @IsNumber() creditLimit?: number;
  @IsOptional() @IsNumber() creditDays?: number;
  @IsOptional() @IsString() gstin?: string;
  @IsOptional() @IsString() pan?: string;
}

export class BulkMappingItemDto {
  @IsString() entityType: string;
  @IsString() entityId: string;
  @IsOptional() @IsString() entityName?: string;
  @IsString() ledgerId: string;
  @IsString() mappingType: string;
}

export class BulkCreateMappingsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkMappingItemDto)
  mappings: BulkMappingItemDto[];
}
