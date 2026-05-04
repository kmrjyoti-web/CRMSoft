import { IsString, IsOptional, IsIn } from 'class-validator';

export class UpdateNotionConfigDto {
  @IsOptional()
  @IsString()
  token?: string;

  @IsOptional()
  @IsString()
  databaseId?: string;
}

export class CreateNotionEntryDto {
  @IsString()
  promptNumber: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsIn(['Planned', 'In Progress', 'Completed'])
  status: string;

  @IsOptional()
  @IsString()
  filesChanged?: string;

  @IsOptional()
  @IsString()
  testResults?: string;
}
