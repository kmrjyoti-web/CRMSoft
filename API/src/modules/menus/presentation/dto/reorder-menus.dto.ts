import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

export class ReorderMenusDto {
  @IsOptional()
  @IsString()
  parentId?: string | null;

  @IsArray()
  @IsUUID('4', { each: true })
  orderedIds: string[];
}
