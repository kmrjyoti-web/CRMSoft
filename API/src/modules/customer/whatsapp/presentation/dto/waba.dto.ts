import { IsString, IsOptional } from 'class-validator';

export class SetupWabaDto {
  @IsString() wabaId: string;
  @IsString() phoneNumberId: string;
  @IsString() phoneNumber: string;
  @IsString() displayName: string;
  @IsString() accessToken: string;
  @IsString() webhookVerifyToken: string;
}

export class UpdateWabaDto {
  @IsOptional() @IsString() displayName?: string;
  @IsOptional() @IsString() accessToken?: string;
  @IsOptional() settings?: any;
}
