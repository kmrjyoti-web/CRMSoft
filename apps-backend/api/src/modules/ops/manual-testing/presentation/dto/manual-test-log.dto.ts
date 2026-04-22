import { IsString, IsOptional, IsArray, IsBoolean } from 'class-validator';

export class CreateManualTestLogDto {
  @IsOptional() @IsString() testRunId?: string;
  @IsOptional() @IsString() testGroupId?: string;
  @IsString() module: string;
  @IsString() pageName: string;
  @IsString() action: string;
  @IsString() expectedResult: string;
  @IsString() actualResult: string;
  @IsString() status: string;
  @IsOptional() @IsString() severity?: string;
  @IsOptional() @IsArray() screenshotUrls?: string[];
  @IsOptional() @IsString() videoUrl?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() browser?: string;
  @IsOptional() @IsString() os?: string;
  @IsOptional() @IsString() screenResolution?: string;
}

export class UpdateManualTestLogDto {
  @IsOptional() @IsString() actualResult?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() severity?: string;
  @IsOptional() @IsArray() screenshotUrls?: string[];
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsBoolean() bugReported?: boolean;
  @IsOptional() @IsString() bugId?: string;
}

export class GetUploadUrlDto {
  @IsString() filename: string;
  @IsString() contentType: string;
}
