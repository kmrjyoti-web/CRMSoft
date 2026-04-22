import { IsString, IsOptional, IsIn } from 'class-validator';

export class CompleteDemoDto {
  @IsIn(['INTERESTED', 'NOT_INTERESTED', 'FOLLOW_UP', 'NO_SHOW'])
  result: string;

  @IsOptional() @IsString()
  outcome?: string;

  @IsOptional() @IsString()
  notes?: string;
}
