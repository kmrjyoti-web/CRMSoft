import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InitializeWorkflowDto {
  @ApiProperty({ example: 'LEAD' })
  @IsString()
  entityType: string;

  @ApiProperty({ example: 'lead-uuid-123' })
  @IsString()
  entityId: string;

  @ApiPropertyOptional({ description: 'Specific workflow ID; uses default if omitted' })
  @IsOptional()
  @IsUUID()
  workflowId?: string;
}
