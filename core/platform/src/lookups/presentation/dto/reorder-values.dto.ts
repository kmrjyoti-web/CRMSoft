import { IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReorderValuesDto {
  @ApiProperty({ type: [String], description: 'Value IDs in desired order' })
  @IsArray() @IsUUID('4', { each: true })
  orderedIds: string[];
}
