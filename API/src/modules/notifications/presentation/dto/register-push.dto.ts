import { IsString, IsOptional } from 'class-validator';

export class RegisterPushDto {
  @IsString()
  endpoint: string;

  @IsOptional() @IsString()
  p256dh?: string;

  @IsOptional() @IsString()
  auth?: string;

  @IsOptional() @IsString()
  deviceType?: string;
}
