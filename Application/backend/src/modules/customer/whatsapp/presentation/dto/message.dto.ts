import { IsString, IsOptional, IsNumber } from 'class-validator';

export class SendTextMessageDto {
  @IsString() wabaId: string;
  @IsString() text: string;
}

export class SendTemplateMessageDto {
  @IsString() wabaId: string;
  @IsString() templateId: string;
  @IsOptional() variables?: any;
}

export class SendMediaMessageDto {
  @IsString() wabaId: string;
  @IsString() type: string;
  @IsString() mediaUrl: string;
  @IsOptional() @IsString() caption?: string;
}

export class SendInteractiveMessageDto {
  @IsString() wabaId: string;
  @IsString() interactiveType: string;
  interactiveData: any;
}

export class SendLocationMessageDto {
  @IsString() wabaId: string;
  @IsNumber() lat: number;
  @IsNumber() lng: number;
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() address?: string;
}
