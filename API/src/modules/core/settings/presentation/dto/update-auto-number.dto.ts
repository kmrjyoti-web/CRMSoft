import {
  IsString, IsOptional, IsInt, Min, IsEnum,
} from 'class-validator';
import { SequenceResetPolicy } from '@prisma/client';

export class UpdateAutoNumberDto {
  @IsOptional() @IsString() prefix?: string;
  @IsOptional() @IsString() formatPattern?: string;
  @IsOptional() @IsInt() @Min(1) seqPadding?: number;
  @IsOptional() @IsInt() @Min(1) startFrom?: number;
  @IsOptional() @IsInt() @Min(1) incrementBy?: number;
  @IsOptional() @IsEnum(SequenceResetPolicy) resetPolicy?: SequenceResetPolicy;
}

export class ResetSequenceDto {
  @IsOptional() @IsInt() @Min(0) newStart?: number;
}
