import { IsOptional, IsString, IsBoolean, Matches } from 'class-validator';

export class UpdateBrandingDto {
  @IsOptional() @IsString() primaryColor?: string;
  @IsOptional() @IsString() secondaryColor?: string;
  @IsOptional() @IsString() accentColor?: string;
  @IsOptional() @IsString() sidebarColor?: string;
  @IsOptional() @IsString() sidebarTextColor?: string;
  @IsOptional() @IsString() headerColor?: string;
  @IsOptional() @IsString() headerTextColor?: string;
  @IsOptional() @IsString() buttonColor?: string;
  @IsOptional() @IsString() buttonTextColor?: string;
  @IsOptional() @IsString() linkColor?: string;
  @IsOptional() @IsString() dangerColor?: string;
  @IsOptional() @IsString() successColor?: string;
  @IsOptional() @IsString() warningColor?: string;
  @IsOptional() @IsString() fontFamily?: string;
  @IsOptional() @IsString() headingFontFamily?: string;
  @IsOptional() @IsString() fontSize?: string;
  @IsOptional() @IsString() loginPageTitle?: string;
  @IsOptional() @IsString() loginPageSubtitle?: string;
  @IsOptional() @IsBoolean() showPoweredBy?: boolean;
  @IsOptional() @IsString() customCss?: string;
}

export class InitiateDomainDto {
  @IsString()
  @Matches(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/)
  domain: string;
}
