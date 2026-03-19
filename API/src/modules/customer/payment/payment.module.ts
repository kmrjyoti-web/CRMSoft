import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../core/prisma/prisma.module';
import { SettingsModule } from '../../core/settings/settings.module';

// ── Services ──
import { GstCalculatorService } from './services/gst-calculator.service';
import { AmountInWordsService } from './services/amount-in-words.service';
import { InvoiceService } from './services/invoice.service';
import { ProformaInvoiceService } from './services/proforma-invoice.service';
import { RazorpayGatewayService } from './services/razorpay-gateway.service';
import { StripeGatewayService } from './services/stripe-gateway.service';
import { PaymentGatewayFactoryService } from './services/payment-gateway-factory.service';
import { PaymentService } from './services/payment.service';
import { ReceiptService } from './services/receipt.service';
import { RefundService } from './services/refund.service';
import { CreditNoteService } from './services/credit-note.service';
import { PaymentReminderService } from './services/payment-reminder.service';
import { PaymentAnalyticsService } from './services/payment-analytics.service';
import { PaymentSeederService } from './services/payment-seeder.service';

// ── Controllers ──
import { InvoiceController } from './presentation/invoice.controller';
import { ProformaInvoiceController } from './presentation/proforma-invoice.controller';
import { PaymentController } from './presentation/payment.controller';
import { ReceiptController } from './presentation/receipt.controller';
import { RefundController } from './presentation/refund.controller';
import { CreditNoteController } from './presentation/credit-note.controller';
import { PaymentWebhookController } from './presentation/payment-webhook.controller';

@Module({
  imports: [PrismaModule, SettingsModule],
  providers: [
    GstCalculatorService,
    AmountInWordsService,
    InvoiceService,
    ProformaInvoiceService,
    RazorpayGatewayService,
    StripeGatewayService,
    PaymentGatewayFactoryService,
    PaymentService,
    ReceiptService,
    RefundService,
    CreditNoteService,
    PaymentReminderService,
    PaymentAnalyticsService,
    PaymentSeederService,
  ],
  controllers: [
    InvoiceController,
    ProformaInvoiceController,
    PaymentController,
    ReceiptController,
    RefundController,
    CreditNoteController,
    PaymentWebhookController,
  ],
  exports: [
    InvoiceService,
    ProformaInvoiceService,
    PaymentService,
    GstCalculatorService,
    AmountInWordsService,
    PaymentReminderService,
    PaymentSeederService,
    ReceiptService,
    RefundService,
    CreditNoteService,
  ],
})
export class PaymentModule {}
