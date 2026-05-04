import { IsIn, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { GenerateReportDto } from './generate-report.dto';

/**
 * DTO for exporting a report to a file format.
 * Extends GenerateReportDto with a required output format.
 */
export class ExportReportDto extends GenerateReportDto {
  /** Output format for the exported report */
  @ApiProperty({
    description: 'Export file format',
    enum: ['PDF', 'EXCEL', 'CSV'],
  })
  @IsString()
  @IsIn(['PDF', 'EXCEL', 'CSV'])
  format: string;
}
