import { IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpgradeOrderDto {
  @ApiProperty({ example: 'WL_PROFESSIONAL' })
  @IsString()
  packageCode: string;

  @ApiProperty({ enum: ['MONTHLY', 'YEARLY'], example: 'MONTHLY' })
  @IsIn(['MONTHLY', 'YEARLY'])
  billingCycle: 'MONTHLY' | 'YEARLY';
}

export class ConfirmUpgradeDto {
  @ApiProperty({ description: 'Razorpay order ID' })
  @IsString()
  orderId: string;

  @ApiProperty({ description: 'Razorpay payment ID' })
  @IsString()
  paymentId: string;

  @ApiProperty({ description: 'Razorpay HMAC-SHA256 signature' })
  @IsString()
  signature: string;

  @ApiProperty({ example: 'WL_PROFESSIONAL' })
  @IsString()
  packageCode: string;

  @ApiProperty({ enum: ['MONTHLY', 'YEARLY'], example: 'MONTHLY' })
  @IsIn(['MONTHLY', 'YEARLY'])
  billingCycle: 'MONTHLY' | 'YEARLY';
}
