import { IsString, IsOptional, IsNumber, Min, MaxLength } from 'class-validator';

export class CreateEnquiryDto {
  @IsString()
  listingId: string;

  @IsString()
  @MaxLength(2000)
  message: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  expectedPrice?: number;

  @IsOptional()
  @IsString()
  deliveryPincode?: string;
}
