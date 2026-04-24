import { IsString, IsOptional } from 'class-validator';

export class BulkTransferDto {
  @IsString() fromUserId: string;
  @IsString() toUserId: string;
  @IsString() reason: string;
  @IsOptional() @IsString() reasonDetail?: string;
  @IsOptional() @IsString() entityType?: string;
}
