import { IsNotEmpty, IsString } from 'class-validator';

export class RsvpDto {
  @IsNotEmpty() @IsString()
  rsvpStatus: string;
}
