import { IsOptional, IsString, IsInt, Min, Max, IsEmail, IsBoolean, IsArray } from 'class-validator';

export class UpdateCompanyProfileDto {
  // Basic
  @IsOptional() @IsString() companyName?: string;
  @IsOptional() @IsString() legalName?: string;
  @IsOptional() @IsString() tradeName?: string;
  @IsOptional() @IsString() tagline?: string;
  @IsOptional() @IsString() industry?: string;
  @IsOptional() @IsString() companySize?: string;
  @IsOptional() @IsInt() @Min(1900) @Max(2100) foundedYear?: number;
  @IsOptional() @IsString() website?: string;
  @IsOptional() @IsString() logoUrl?: string;
  // Contact
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() alternatePhone?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsEmail() supportEmail?: string;
  @IsOptional() @IsEmail() billingEmail?: string;
  // Address
  @IsOptional() @IsString() addressLine1?: string;
  @IsOptional() @IsString() addressLine2?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() state?: string;
  @IsOptional() @IsString() stateCode?: string;
  @IsOptional() @IsString() country?: string;
  @IsOptional() @IsString() countryCode?: string;
  @IsOptional() @IsString() pincode?: string;
  @IsOptional() @IsString() gstStateCode?: string;
  @IsOptional() @IsString() landmark?: string;
  @IsOptional() @IsString() regAddressLine1?: string;
  @IsOptional() @IsString() regAddressLine2?: string;
  @IsOptional() @IsString() regCity?: string;
  @IsOptional() @IsString() regState?: string;
  @IsOptional() @IsString() regCountry?: string;
  @IsOptional() @IsString() regPincode?: string;
  // Tax
  @IsOptional() @IsString() gstNumber?: string;
  @IsOptional() @IsString() panNumber?: string;
  @IsOptional() @IsString() tanNumber?: string;
  @IsOptional() @IsString() cinNumber?: string;
  @IsOptional() @IsString() msmeNumber?: string;
  @IsOptional() @IsString() msmeType?: string;
  @IsOptional() @IsString() importExportCode?: string;
  @IsOptional() @IsString() taxType?: string;
  @IsOptional() @IsBoolean() compositionScheme?: boolean;
  @IsOptional() @IsBoolean() reverseChargeMechanism?: boolean;
  // Financial year
  @IsOptional() @IsInt() @Min(1) @Max(12) financialYearStart?: number;
  @IsOptional() @IsInt() @Min(1) @Max(12) financialYearEnd?: number;
  @IsOptional() @IsString() currentFinancialYear?: string;
  // Working pattern
  @IsOptional() @IsString() workingPattern?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) workingDays?: string[];
  @IsOptional() @IsString() workingHoursStart?: string;
  @IsOptional() @IsString() workingHoursEnd?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) weekOff?: string[];
  // Accounting
  @IsOptional() @IsString() accountingMethod?: string;
  @IsOptional() @IsString() balancingMethod?: string;
  @IsOptional() @IsInt() @Min(0) @Max(4) decimalPlaces?: number;
  @IsOptional() @IsString() numberFormat?: string;
  @IsOptional() @IsString() currencyCode?: string;
  @IsOptional() @IsString() currencySymbol?: string;
  // Inventory
  @IsOptional() @IsString() inventoryMethod?: string;
  @IsOptional() @IsBoolean() negativeStockAllowed?: boolean;
  @IsOptional() @IsBoolean() autoStockDeduction?: boolean;
  @IsOptional() @IsBoolean() batchTracking?: boolean;
  @IsOptional() @IsBoolean() serialTracking?: boolean;
  @IsOptional() @IsBoolean() expiryTracking?: boolean;
  // Invoice settings
  @IsOptional() @IsString() invoicePrefix?: string;
  @IsOptional() @IsInt() @Min(1) invoiceStartNumber?: number;
  @IsOptional() @IsString() purchasePrefix?: string;
  @IsOptional() @IsInt() @Min(1) purchaseStartNumber?: number;
  @IsOptional() @IsString() quotationPrefix?: string;
  @IsOptional() @IsInt() @Min(1) quotationStartNumber?: number;
  // Bank
  @IsOptional() @IsString() bankName?: string;
  @IsOptional() @IsString() bankBranch?: string;
  @IsOptional() @IsString() accountNumber?: string;
  @IsOptional() @IsString() ifscCode?: string;
  @IsOptional() @IsString() accountType?: string;
  @IsOptional() @IsString() upiId?: string;
  // Social
  @IsOptional() @IsString() linkedinUrl?: string;
  @IsOptional() @IsString() facebookUrl?: string;
  @IsOptional() @IsString() twitterUrl?: string;
  @IsOptional() @IsString() instagramUrl?: string;
  @IsOptional() @IsString() youtubeUrl?: string;
  // Locale
  @IsOptional() @IsString() timezone?: string;
  @IsOptional() @IsString() locale?: string;
  @IsOptional() @IsString() dateFormat?: string;
  @IsOptional() @IsString() timeFormat?: string;
  // Terms
  @IsOptional() @IsString() defaultTerms?: string;
  @IsOptional() @IsString() defaultNotes?: string;
}
