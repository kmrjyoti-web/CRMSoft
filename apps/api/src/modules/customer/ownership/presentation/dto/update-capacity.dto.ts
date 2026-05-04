import { IsOptional, IsNumber, IsBoolean, IsDateString, IsString } from 'class-validator';

export class UpdateCapacityDto {
  @IsOptional() @IsNumber() maxLeads?: number;
  @IsOptional() @IsNumber() maxContacts?: number;
  @IsOptional() @IsNumber() maxOrganizations?: number;
  @IsOptional() @IsNumber() maxQuotations?: number;
  @IsOptional() @IsNumber() maxTotal?: number;
}

export class SetAvailabilityDto {
  @IsString() userId: string;
  @IsBoolean() isAvailable: boolean;
  @IsOptional() @IsDateString() unavailableFrom?: string;
  @IsOptional() @IsDateString() unavailableTo?: string;
  @IsOptional() @IsString() delegateToId?: string;
  @IsOptional() @IsString() reason?: string;
}
