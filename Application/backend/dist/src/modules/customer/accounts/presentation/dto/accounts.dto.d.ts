export declare class CreatePaymentDto {
    paymentType: string;
    entityType: string;
    entityId: string;
    entityName?: string;
    referenceType?: string;
    referenceId?: string;
    amount: number;
    paymentMode: string;
    bankAccountId?: string;
    chequeNumber?: string;
    chequeDate?: string;
    transactionRef?: string;
    upiId?: string;
    tdsApplicable?: boolean;
    tdsRate?: number;
    tdsSection?: string;
    paymentDate: string;
    narration?: string;
}
export declare class ApprovePaymentDto {
    remarks?: string;
}
export declare class BulkPaymentDto {
    entityId: string;
    entityType: string;
    invoiceIds: string[];
    totalAmount: number;
    paymentMode: string;
    bankAccountId?: string;
    paymentDate: string;
}
export declare class CreateBankAccountDto {
    bankName: string;
    accountNumber: string;
    accountType: string;
    ifscCode: string;
    branchName?: string;
    ledgerId?: string;
    openingBalance?: number;
    isDefault?: boolean;
}
export declare class SubmitReconciliationDto {
    bankAccountId: string;
    reconciliationDate: string;
    statementBalance: number;
}
export declare class GenerateGSTDto {
    period: string;
}
export declare class FileGSTDto {
    acknowledgementNo?: string;
}
export declare class DepositTDSDto {
    depositDate: string;
    challanNumber?: string;
}
export declare class CreateJournalEntryDto {
    transactionDate: string;
    debitLedgerId: string;
    creditLedgerId: string;
    amount: number;
    narration?: string;
    referenceType?: string;
    referenceId?: string;
}
export declare class CreateLedgerDto {
    code?: string;
    name: string;
    groupType: string;
    subGroup?: string;
    parentId?: string;
    openingBalance?: number;
}
export declare class CreateAccountGroupDto {
    name: string;
    code: string;
    primaryGroup: string;
    parentId?: string;
    nature?: string;
    isProhibited?: boolean;
}
export declare class UpdateAccountGroupDto {
    name?: string;
    parentId?: string;
    isProhibited?: boolean;
    isActive?: boolean;
}
export declare class CreateSaleMasterDto {
    name: string;
    code: string;
    igstRate?: number;
    cgstRate?: number;
    sgstRate?: number;
    cessRate?: number;
    natureOfTransaction?: string;
    taxability?: string;
    localLedgerId?: string;
    centralLedgerId?: string;
    igstLedgerId?: string;
    cgstLedgerId?: string;
    sgstLedgerId?: string;
    cessLedgerId?: string;
    isDefault?: boolean;
    sortOrder?: number;
}
export declare class UpdateSaleMasterDto {
    name?: string;
    igstRate?: number;
    cgstRate?: number;
    sgstRate?: number;
    cessRate?: number;
    natureOfTransaction?: string;
    taxability?: string;
    localLedgerId?: string;
    centralLedgerId?: string;
    igstLedgerId?: string;
    cgstLedgerId?: string;
    sgstLedgerId?: string;
    cessLedgerId?: string;
    isDefault?: boolean;
    sortOrder?: number;
    isActive?: boolean;
}
export declare class CreatePurchaseMasterDto {
    name: string;
    code: string;
    igstRate?: number;
    cgstRate?: number;
    sgstRate?: number;
    cessRate?: number;
    natureOfTransaction?: string;
    taxability?: string;
    localLedgerId?: string;
    centralLedgerId?: string;
    igstLedgerId?: string;
    cgstLedgerId?: string;
    sgstLedgerId?: string;
    cessLedgerId?: string;
    isDefault?: boolean;
    sortOrder?: number;
}
export declare class UpdatePurchaseMasterDto {
    name?: string;
    igstRate?: number;
    cgstRate?: number;
    sgstRate?: number;
    cessRate?: number;
    natureOfTransaction?: string;
    taxability?: string;
    localLedgerId?: string;
    centralLedgerId?: string;
    igstLedgerId?: string;
    cgstLedgerId?: string;
    sgstLedgerId?: string;
    cessLedgerId?: string;
    isDefault?: boolean;
    sortOrder?: number;
    isActive?: boolean;
}
export declare class CreateRichLedgerDto {
    code?: string;
    name: string;
    groupType?: string;
    subGroup?: string;
    parentId?: string;
    accountGroupId?: string;
    openingBalance?: number;
    openingBalanceType?: string;
    aliasName?: string;
    mailTo?: string;
    address?: string;
    country?: string;
    countryCode?: string;
    state?: string;
    stateCode?: string;
    gstStateCode?: string;
    city?: string;
    pincode?: string;
    station?: string;
    currency?: string;
    balancingMethod?: string;
    creditDays?: number;
    creditLimit?: number;
    phoneOffice?: string;
    mobile1?: string;
    mobile2?: string;
    whatsappNo?: string;
    email?: string;
    ledgerType?: string;
    panNo?: string;
    gstin?: string;
    gstApplicable?: boolean;
    gstType?: string;
    bankName?: string;
    bankAccountNo?: string;
    bankIfsc?: string;
    bankBranch?: string;
}
export declare class CreateLedgerMappingDto {
    entityType: string;
    entityId: string;
    entityName?: string;
    ledgerId: string;
    mappingType: string;
    creditLimit?: number;
    creditDays?: number;
    gstin?: string;
    pan?: string;
}
export declare class BulkMappingItemDto {
    entityType: string;
    entityId: string;
    entityName?: string;
    ledgerId: string;
    mappingType: string;
}
export declare class BulkCreateMappingsDto {
    mappings: BulkMappingItemDto[];
}
