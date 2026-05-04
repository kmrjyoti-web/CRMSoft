import { IsString, IsOptional, IsDateString } from 'class-validator';

export class DelegateOwnershipDto {
  @IsString() fromUserId: string;
  @IsString() toUserId: string;
  @IsDateString() startDate: string;
  @IsDateString() endDate: string;
  @IsString() reason: string;
  @IsOptional() @IsString() entityType?: string;
}
