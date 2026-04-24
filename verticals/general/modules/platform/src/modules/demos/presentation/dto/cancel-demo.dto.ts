import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CancelDemoDto {
  @IsString()
  reason: string;

  @IsOptional() @IsBoolean()
  isNoShow?: boolean;
}
