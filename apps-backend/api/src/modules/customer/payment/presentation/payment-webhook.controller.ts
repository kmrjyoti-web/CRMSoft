import {
  Controller, Post, Body, Headers, Req, Param, RawBodyRequest, Logger,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaymentService } from '../services/payment.service';
import { RazorpayGatewayService } from '../services/razorpay-gateway.service';
import { StripeGatewayService } from '../services/stripe-gateway.service';
import { PaymentGatewayFactoryService } from '../services/payment-gateway-factory.service';
import { getErrorMessage } from '@/common/utils/error.utils';

@ApiTags('Payment Webhooks')
@Controller('webhooks/payment')
export class PaymentWebhookController {
  private readonly logger = new Logger(PaymentWebhookController.name);

  constructor(
    private readonly paymentService: PaymentService,
    private readonly razorpay: RazorpayGatewayService,
    private readonly stripe: StripeGatewayService,
    private readonly gatewayFactory: PaymentGatewayFactoryService,
  ) {}

  /** Razorpay webhook endpoint */
  @Post('razorpay/:tenantId')
  async razorpayWebhook(
    @Param('tenantId') tenantId: string,
    @Body() body: any,
    @Headers('x-razorpay-signature') signature: string,
  ) {
    this.logger.log(`Razorpay webhook received for tenant ${tenantId}: ${body.event}`);

    try {
      const creds = await this.gatewayFactory.getCredentials(tenantId, 'RAZORPAY');
      if (creds.webhookSecret && signature) {
        const rawBody = JSON.stringify(body);
        const valid = this.razorpay.verifyWebhookSignature(creds.webhookSecret, rawBody, signature);
        if (!valid) {
          this.logger.warn('Razorpay webhook signature invalid');
          return { status: 'invalid_signature' };
        }
      }

      await this.paymentService.handleWebhook(tenantId, 'RAZORPAY', body.event, body.payload);
      return { status: 'ok' };
    } catch (err) {
      this.logger.error(`Razorpay webhook error: ${getErrorMessage(err)}`);
      return { status: 'error', message: getErrorMessage(err) };
    }
  }

  /** Stripe webhook endpoint */
  @Post('stripe/:tenantId')
  async stripeWebhook(
    @Param('tenantId') tenantId: string,
    @Body() body: any,
    @Headers('stripe-signature') signature: string,
  ) {
    this.logger.log(`Stripe webhook received for tenant ${tenantId}: ${body.type}`);

    try {
      const creds = await this.gatewayFactory.getCredentials(tenantId, 'STRIPE');
      if (creds.webhookSecret && signature) {
        const rawBody = JSON.stringify(body);
        const valid = this.stripe.verifyWebhookSignature(creds.webhookSecret, rawBody, signature);
        if (!valid) {
          this.logger.warn('Stripe webhook signature invalid');
          return { status: 'invalid_signature' };
        }
      }

      await this.paymentService.handleWebhook(tenantId, 'STRIPE', body.type, body);
      return { status: 'ok' };
    } catch (err) {
      this.logger.error(`Stripe webhook error: ${getErrorMessage(err)}`);
      return { status: 'error', message: getErrorMessage(err) };
    }
  }
}
