import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UnmaskRequestDto {
  @ApiProperty({ example: 'contacts' })
  @IsString()
  tableKey: string;

  @ApiProperty({ example: 'email' })
  @IsString()
  columnId: string;

  @ApiProperty({ example: 'uuid-of-record' })
  @IsString()
  recordId: string;
}
