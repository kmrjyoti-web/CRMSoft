import { IsString } from 'class-validator';

export class CostEstimateDto {
  @IsString()
  serviceKey: string;
}
