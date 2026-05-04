import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CheckInDto {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsOptional() @IsString()
  photoUrl?: string;
}

export class CheckOutDto {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsOptional() @IsString()
  photoUrl?: string;

  @IsOptional() @IsString()
  outcome?: string;

  @IsOptional() @IsString()
  notes?: string;
}
