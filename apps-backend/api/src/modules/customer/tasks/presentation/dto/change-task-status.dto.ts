import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class ChangeTaskStatusDto {
  @IsNotEmpty()
  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
