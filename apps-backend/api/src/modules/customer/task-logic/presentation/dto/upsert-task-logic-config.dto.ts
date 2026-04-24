import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpsertTaskLogicConfigDto {
  @IsNotEmpty()
  value: Record<string, unknown>;

  @IsOptional()
  @IsString()
  description?: string;
}
