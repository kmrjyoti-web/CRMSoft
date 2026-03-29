import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpsertTaskLogicConfigDto {
  @IsNotEmpty()
  value: any;

  @IsOptional()
  @IsString()
  description?: string;
}
