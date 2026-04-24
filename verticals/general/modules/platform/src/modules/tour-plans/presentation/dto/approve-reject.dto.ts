import { IsString, IsOptional } from 'class-validator';

export class ApproveTourPlanDto {
  @IsOptional() @IsString()
  comment?: string;
}

export class RejectTourPlanDto {
  @IsString()
  reason: string;
}
