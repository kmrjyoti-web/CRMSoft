import { IsString, IsOptional, IsObject, IsArray } from 'class-validator';

export class SendNotificationDto {
  @IsString()
  templateName: string;

  @IsString()
  recipientId: string;

  @IsObject()
  variables: Record<string, string>;

  @IsOptional() @IsString()
  entityType?: string;

  @IsOptional() @IsString()
  entityId?: string;

  @IsOptional() @IsString()
  priority?: string;

  @IsOptional() @IsString()
  groupKey?: string;

  @IsOptional() @IsArray()
  channelOverrides?: string[];
}
