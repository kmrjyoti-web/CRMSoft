import { IsString, IsOptional, IsDateString } from 'class-validator';

export class ExportReportDto {
  @IsString()
  reportType: string;

  @IsString()
  format: string;

  @IsOptional() @IsDateString()
  dateFrom?: string;

  @IsOptional() @IsDateString()
  dateTo?: string;

  @IsOptional() @IsString()
  userId?: string;

  @IsOptional() @IsString()
  status?: string;
}
