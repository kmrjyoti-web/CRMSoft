import { IsInt, IsString, IsOptional, Min } from 'class-validator';

export class DebitWalletDto {
  @IsInt()
  @Min(1)
  tokens: number;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  serviceKey?: string;

  @IsString()
  @IsOptional()
  referenceType?: string;

  @IsString()
  @IsOptional()
  referenceId?: string;
}
