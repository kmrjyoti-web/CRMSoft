import { IsString, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PaymentWebhookDto {
  @ApiProperty({ description: 'Webhook event type' })
  @IsString()
  event: string;

  @ApiProperty({ description: 'Webhook payload', type: Object })
  @IsObject()
  payload: any;

  @ApiProperty({ description: 'Webhook signature for verification' })
  @IsString()
  signature: string;
}
