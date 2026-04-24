export class CreatePartnerDto {
  partnerCode: string;
  partnerName: string;
  legalName?: string;
  contactPerson?: string;
  contactEmail: string;
  contactPhone?: string;
  city?: string;
  state?: string;
  country?: string;
  businessType?: string;
  industry?: string;
  gstin?: string;
  pan?: string;
  brandCode?: string;
  webhookUrl?: string;
  maxTenants?: number;
  maxUsers?: number;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
  trialEndsAt?: string;
}

export class UpdatePartnerDto {
  partnerName?: string;
  legalName?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  city?: string;
  state?: string;
  businessType?: string;
  industry?: string;
  brandCode?: string;
  webhookUrl?: string;
  maxTenants?: number;
  maxUsers?: number;
  isActive?: boolean;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
}
