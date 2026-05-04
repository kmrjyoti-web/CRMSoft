import { IsString, IsOptional } from 'class-validator';

export class CreateQuickReplyDto {
  @IsString() wabaId: string;
  @IsString() shortcut: string;
  @IsString() message: string;
  @IsOptional() @IsString() category?: string;
}
