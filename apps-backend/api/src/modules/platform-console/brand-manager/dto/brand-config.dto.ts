export class CreateBrandConfigDto {
  brandCode: string;
  brandName: string;
  displayName: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  logoUrl?: string;
  faviconUrl?: string;
  fontFamily?: string;
  domain?: string;
  subdomain?: string;
  contactEmail?: string;
  supportUrl?: string;
  description?: string;
  isDefault?: boolean;
}

export class UpdateBrandConfigDto {
  brandName?: string;
  displayName?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  logoUrl?: string;
  faviconUrl?: string;
  fontFamily?: string;
  domain?: string;
  subdomain?: string;
  contactEmail?: string;
  supportUrl?: string;
  description?: string;
  isActive?: boolean;
  isDefault?: boolean;
}
