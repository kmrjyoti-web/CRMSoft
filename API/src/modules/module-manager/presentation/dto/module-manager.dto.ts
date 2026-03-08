import { IsObject, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCredentialsDto {
  @ApiProperty({
    description: 'Credentials key-value pairs matching the module credential schema',
    example: { apiKey: 'sk_live_xxx', secret: 'whsec_xxx' },
  })
  @IsObject()
  credentials: Record<string, any>;
}

export class EnableModuleDto {
  @ApiPropertyOptional({
    description: 'Optional note for enabling this module',
    example: 'Enabled for Q1 campaign',
  })
  @IsOptional()
  @IsString()
  note?: string;
}
