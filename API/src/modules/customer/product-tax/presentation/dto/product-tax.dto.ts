import {
  IsString, IsNumber, IsOptional, IsBoolean, IsArray,
  IsUUID, ValidateNested, Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class TaxDetailItem {
  @ApiProperty({ example: 'CGST' })
  @IsString()
  taxName: string;

  @ApiProperty({ example: 9 })
  @IsNumber()
  @Min(0)
  taxRate: number;

  @ApiPropertyOptional({ example: 'Central GST at 9%' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class SetTaxDetailsDto {
  @ApiProperty({ type: [TaxDetailItem] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaxDetailItem)
  taxes: TaxDetailItem[];
}

export class CalculateGstDto {
  @ApiProperty({ example: 1000 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ example: 18 })
  @IsNumber()
  @Min(0)
  gstRate: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cessRate?: number;

  @ApiProperty({ example: false })
  @IsBoolean()
  isInterState: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  taxInclusive: boolean;
}

export interface TaxComponent {
  rate: number;
  amount: number;
}

export interface GSTBreakup {
  baseAmount: number;
  gstRate: number;
  isInterState: boolean;
  cgst: TaxComponent | null;
  sgst: TaxComponent | null;
  igst: TaxComponent | null;
  cess: TaxComponent;
  totalTax: number;
  grandTotal: number;
}
