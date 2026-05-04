import { IsArray, IsBoolean, IsEnum, IsInt, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class PlanLimitItemDto {
  @IsString()
  resourceKey: string;

  @IsEnum(['TOTAL', 'MONTHLY', 'UNLIMITED', 'DISABLED'])
  limitType: 'TOTAL' | 'MONTHLY' | 'UNLIMITED' | 'DISABLED';

  @IsInt()
  @Min(0)
  @IsOptional()
  limitValue?: number = 0;

  @IsBoolean()
  @IsOptional()
  isChargeable?: boolean = false;

  @IsInt()
  @Min(0)
  @IsOptional()
  chargeTokens?: number = 0;
}

export class UpsertPlanLimitsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlanLimitItemDto)
  limits: PlanLimitItemDto[];
}
