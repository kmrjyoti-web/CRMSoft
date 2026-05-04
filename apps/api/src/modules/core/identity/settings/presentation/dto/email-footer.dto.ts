import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateEmailFooterDto {
  @IsString() name: string;
  @IsString() bodyHtml: string;
  @IsOptional() @IsBoolean() isDefault?: boolean;
}

export class UpdateEmailFooterDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() bodyHtml?: string;
  @IsOptional() @IsBoolean() isDefault?: boolean;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
