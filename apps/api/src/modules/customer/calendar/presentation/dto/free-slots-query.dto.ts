import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
  IsArray,
  IsDateString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class FreeSlotsQueryDto {
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(5)
  durationMinutes: number;

  @IsArray()
  @IsString({ each: true })
  userIds: string[];

  @IsOptional()
  @IsString()
  timezone?: string;
}

export class ConflictCheckDto {
  @IsNotEmpty()
  @IsDateString()
  startTime: string;

  @IsNotEmpty()
  @IsDateString()
  endTime: string;

  @IsOptional()
  @IsString()
  excludeEventId?: string;
}
