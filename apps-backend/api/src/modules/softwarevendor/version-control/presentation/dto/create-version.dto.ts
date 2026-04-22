import { IsString, IsOptional, IsArray, IsIn } from 'class-validator';

export class CreateVersionDto {
  @IsString() version: string;
  @IsIn(['MAJOR', 'MINOR', 'PATCH', 'HOTFIX']) releaseType: string;
  @IsOptional() @IsString() codeName?: string;
  @IsOptional() @IsArray() changelog?: Record<string, unknown>[];
  @IsOptional() @IsArray() breakingChanges?: string[];
  @IsOptional() @IsString() migrationNotes?: string;
  @IsOptional() @IsString() gitBranch?: string;
}

export class PublishVersionDto {
  @IsOptional() @IsString() gitTag?: string;
  @IsOptional() @IsString() gitCommitHash?: string;
}

export class RollbackVersionDto {
  @IsString() rollbackReason: string;
}

export class CreatePatchDto {
  @IsString() industryCode: string;
  @IsString() patchName: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() schemaChanges?: Record<string, unknown>;
  @IsOptional() configOverrides?: Record<string, unknown>;
  @IsOptional() menuOverrides?: Record<string, unknown>;
  @IsOptional() forceUpdate?: boolean;
}
