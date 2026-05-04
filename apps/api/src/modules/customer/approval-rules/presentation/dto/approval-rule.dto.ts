import {
  IsString, IsOptional, IsNumber, IsBoolean, IsArray, Min,
} from 'class-validator';

export class CreateApprovalRuleDto {
  @IsString()
  entityType: string;

  @IsString()
  action: string;

  @IsString()
  checkerRole: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  minCheckers?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skipForRoles?: string[];

  @IsOptional()
  @IsString()
  amountField?: string;

  @IsOptional()
  @IsNumber()
  amountThreshold?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  expiryHours?: number;
}

export class UpdateApprovalRuleDto {
  @IsOptional()
  @IsString()
  checkerRole?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  minCheckers?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skipForRoles?: string[];

  @IsOptional()
  @IsString()
  amountField?: string;

  @IsOptional()
  @IsNumber()
  amountThreshold?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  expiryHours?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
