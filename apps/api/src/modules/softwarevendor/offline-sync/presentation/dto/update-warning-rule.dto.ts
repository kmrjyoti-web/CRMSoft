import { PartialType } from '@nestjs/swagger';
import { CreateWarningRuleDto } from './create-warning-rule.dto';
import { IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateWarningRuleDto extends PartialType(CreateWarningRuleDto) {
  @ApiPropertyOptional({ description: 'Enable or disable this rule' })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}
