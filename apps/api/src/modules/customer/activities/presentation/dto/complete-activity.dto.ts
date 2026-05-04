import { IsString, IsOptional } from 'class-validator';

export class CompleteActivityDto {
  @IsOptional() @IsString()
  outcome?: string;
}
