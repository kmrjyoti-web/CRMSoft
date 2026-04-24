import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangeRelationTypeDto {
  @ApiProperty({
    enum: ['PRIMARY_CONTACT', 'EMPLOYEE', 'CONSULTANT', 'PARTNER', 'VENDOR', 'DIRECTOR', 'FOUNDER'],
  })
  @IsEnum(['PRIMARY_CONTACT', 'EMPLOYEE', 'CONSULTANT', 'PARTNER', 'VENDOR', 'DIRECTOR', 'FOUNDER'])
  relationType: string;
}
