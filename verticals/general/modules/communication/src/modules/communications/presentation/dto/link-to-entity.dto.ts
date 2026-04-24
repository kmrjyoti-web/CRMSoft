import { IsString, IsUUID, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LinkToEntityDto {
  @ApiProperty({ enum: ['contact', 'organization', 'lead'] })
  @IsEnum(['contact', 'organization', 'lead'])
  entityType: 'contact' | 'organization' | 'lead';

  @ApiProperty() @IsUUID()
  entityId: string;
}
