import { IsArray, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateTestGroupDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsOptional()
  @IsString()
  nameHi?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsArray()
  @IsString({ each: true })
  modules: string[];

  @IsArray()
  steps: any[];

  @IsOptional()
  @IsNumber()
  estimatedDuration?: number;
}

export class UpdateTestGroupDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() nameHi?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() icon?: string;
  @IsOptional() @IsString() color?: string;
  @IsOptional() @IsArray() modules?: string[];
  @IsOptional() @IsArray() steps?: any[];
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsNumber() estimatedDuration?: number;
}
