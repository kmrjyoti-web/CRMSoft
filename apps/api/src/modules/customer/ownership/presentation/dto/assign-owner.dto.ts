import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';

export class AssignOwnerDto {
  @IsString() entityType: string;
  @IsString() entityId: string;
  @IsString() userId: string;
  @IsString() ownerType: string;
  @IsString() reason: string;
  @IsOptional() @IsString() reasonDetail?: string;
  @IsOptional() @IsString() method?: string;
  @IsOptional() @IsDateString() validFrom?: string;
  @IsOptional() @IsDateString() validTo?: string;
}
