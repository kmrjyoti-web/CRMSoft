import { IsString, IsOptional, IsNumber, IsArray, IsInt, Min, Max, MaxLength } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  listingId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsArray()
  mediaUrls?: any[];

  @IsOptional()
  @IsString()
  orderId?: string;
}
