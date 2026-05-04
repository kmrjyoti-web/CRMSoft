import { IsString, IsOptional, IsEnum } from 'class-validator';

export class UploadFileDto {
  @IsString()
  targetEntity: string;
}

export class SelectProfileDto {
  @IsString()
  profileId: string;
}

export class SaveProfileDto {
  @IsString()
  name: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsString()
  sourceSystem?: string;
}
