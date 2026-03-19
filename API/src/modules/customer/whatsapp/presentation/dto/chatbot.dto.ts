import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateChatbotFlowDto {
  @IsString() wabaId: string;
  @IsString() name: string;
  @IsArray() triggerKeywords: string[];
  nodes: any;
}

export class UpdateChatbotFlowDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsArray() triggerKeywords?: string[];
  @IsOptional() nodes?: any;
}

export class ToggleChatbotFlowDto {
  @IsString() status: string;
}
