import { IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResolveConflictDto {
  @ApiProperty({ description: 'Resolved data — user\'s chosen values per field' })
  @IsObject()
  resolvedData: Record<string, any>;
}
