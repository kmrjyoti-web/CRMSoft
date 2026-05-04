import {
  IsString, IsOptional, IsBoolean, IsInt, IsIn, IsUUID, MinLength,
} from 'class-validator';

export class UpdateMenuDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  route?: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsIn(['GROUP', 'ITEM', 'DIVIDER'])
  menuType?: string;

  @IsOptional()
  @IsString()
  permissionModule?: string;

  @IsOptional()
  @IsString()
  permissionAction?: string;

  @IsOptional()
  @IsString()
  badgeColor?: string;

  @IsOptional()
  @IsString()
  badgeText?: string;

  @IsOptional()
  @IsBoolean()
  openInNewTab?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
