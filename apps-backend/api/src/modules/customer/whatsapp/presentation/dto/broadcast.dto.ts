import { IsString, IsOptional, IsNumber, IsArray, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../../../common/dto/pagination.dto';

export class CreateBroadcastDto {
  @IsString() wabaId: string;
  @IsString() name: string;
  @IsString() templateId: string;
  @IsOptional() @IsDateString() scheduledAt?: string;
  @IsOptional() @IsNumber() throttlePerSecond?: number;
}

export class BroadcastRecipientDto {
  @IsString() phoneNumber: string;
  @IsOptional() @IsString() contactName?: string;
  @IsOptional() variables?: Record<string, unknown>;
}

export class AddBroadcastRecipientsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BroadcastRecipientDto)
  recipients: BroadcastRecipientDto[];
}

export class BroadcastQueryDto extends PaginationDto {
  @IsString() wabaId: string;
  @IsOptional() @IsString() status?: string;
}

export class BroadcastRecipientQueryDto extends PaginationDto {
  @IsOptional() @IsString() status?: string;
}
