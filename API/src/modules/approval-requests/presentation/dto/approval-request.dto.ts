import { IsString, IsOptional, IsObject } from 'class-validator';

export class SubmitApprovalDto {
  @IsString()
  entityType: string;

  @IsOptional()
  @IsString()
  entityId?: string;

  @IsString()
  action: string;

  @IsOptional()
  @IsObject()
  payload?: Record<string, any>;

  @IsOptional()
  @IsString()
  makerNote?: string;
}

export class ApproveRejectDto {
  @IsOptional()
  @IsString()
  note?: string;
}
