import { IsArray, IsIn, IsOptional, IsString, IsUUID } from 'class-validator';

const VALID_TYPES = ['UNIT', 'FUNCTIONAL', 'SMOKE', 'INTEGRATION', 'ARCHITECTURE', 'PENETRATION'];

export class CreateTestRunDto {
  @IsOptional()
  @IsUUID()
  testEnvId?: string;

  @IsOptional()
  @IsArray()
  @IsIn(VALID_TYPES, { each: true })
  testTypes?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetModules?: string[];
}
