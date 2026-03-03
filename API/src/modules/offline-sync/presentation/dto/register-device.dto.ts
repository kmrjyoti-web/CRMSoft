import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDeviceDto {
  @ApiProperty({ description: 'Unique device identifier' })
  @IsString()
  deviceId: string;

  @ApiPropertyOptional({ description: 'Device name (e.g., "Rahul\'s iPhone")' })
  @IsOptional()
  @IsString()
  deviceName?: string;

  @ApiPropertyOptional({ description: 'Device type: MOBILE, TABLET, DESKTOP, PWA' })
  @IsOptional()
  @IsString()
  deviceType?: string;

  @ApiPropertyOptional({ description: 'Platform: iOS, Android, Web' })
  @IsOptional()
  @IsString()
  platform?: string;

  @ApiPropertyOptional({ description: 'App version string' })
  @IsOptional()
  @IsString()
  appVersion?: string;
}
