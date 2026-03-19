import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Injectable()
export class InvoiceGeneratorService {
  private readonly logger = new Logger(InvoiceGeneratorService.name);

  constructor(private readonly prisma: PrismaService) {}

  async generate(data: {
    tenantId: string;
    subscriptionId: string;
    periodStart: Date;
    periodEnd: Date;
    amount: number;
    tax: number;
  }) {
    const invoiceNumber = `INV-${Date.now()}`;
    const total = data.amount + data.tax;

    const invoice = await this.prisma.tenantInvoice.create({
      data: {
        tenantId: data.tenantId,
        invoiceNumber,
        amount: data.amount,
        tax: data.tax,
        total,
        status: 'PENDING',
        periodStart: data.periodStart,
        periodEnd: data.periodEnd,
      },
    });

    this.logger.log(`Invoice generated: ${invoice.invoiceNumber} for tenant ${data.tenantId}`);
    return invoice;
  }

  async generatePdf(invoiceId: string): Promise<string> {
    // Stub: generate PDF and return URL
    this.logger.log(`Generating PDF for invoice ${invoiceId}`);
    const pdfUrl = `/invoices/${invoiceId}.pdf`;

    await this.prisma.tenantInvoice.update({
      where: { id: invoiceId },
      data: { pdfUrl },
    });

    return pdfUrl;
  }
}
