import {
  IsOptional, IsInt, IsBoolean, IsEnum, Min, IsObject,
} from 'class-validator';
import { RetentionAction } from '@prisma/identity-client';

export class UpdateDataRetentionDto {
  @IsOptional() @IsInt() @Min(1) retentionDays?: number;
  @IsOptional() @IsEnum(RetentionAction) action?: RetentionAction;
  @IsOptional() @IsObject() scopeFilter?: Record<string, any>;
  @IsOptional() @IsBoolean() isEnabled?: boolean;
  @IsOptional() @IsBoolean() requireApproval?: boolean;
  @IsOptional() @IsInt() @Min(1) notifyBeforeDays?: number;
}
