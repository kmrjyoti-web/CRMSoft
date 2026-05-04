import { IsString, IsOptional, IsObject } from 'class-validator';

export class RowActionDto {
  @IsString()
  action: 'ACCEPT' | 'SKIP' | 'FORCE_CREATE';
}

export class RowBulkActionDto {
  @IsString()
  action: 'ACCEPT_ALL_VALID' | 'SKIP_ALL_DUPLICATES' | 'SKIP_ALL_INVALID' | 'ACCEPT_ALL';
}

export class EditRowDto {
  @IsObject()
  editedData: Record<string, any>;
}

export class RowQueryDto {
  @IsOptional() @IsString() status?: string;
  @IsOptional() page?: number;
  @IsOptional() limit?: number;
}
