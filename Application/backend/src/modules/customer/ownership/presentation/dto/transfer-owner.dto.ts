import { IsString, IsOptional } from 'class-validator';

export class TransferOwnerDto {
  @IsString() entityType: string;
  @IsString() entityId: string;
  @IsString() fromUserId: string;
  @IsString() toUserId: string;
  @IsString() ownerType: string;
  @IsString() reason: string;
  @IsOptional() @IsString() reasonDetail?: string;
}
