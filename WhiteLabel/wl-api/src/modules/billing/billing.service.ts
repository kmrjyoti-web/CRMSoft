import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class BillingService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  private getCurrentPeriod(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }

  async recordUsage(dto: { partnerId: string; serviceCode: string; units: number }) {
    const partner = await this.prisma.whiteLabelPartner.findUnique({ where: { id: dto.partnerId } });
    if (!partner) throw new NotFoundException('Partner not found');

    const [partnerPricing, customerPricing, service] = await Promise.all([
      this.prisma.partnerServicePricing.findUnique({
        where: { partnerId_serviceCode: { partnerId: dto.partnerId, serviceCode: dto.serviceCode } },
      }),
      this.prisma.partnerCustomerPricing.findUnique({
        where: { partnerId_serviceCode: { partnerId: dto.partnerId, serviceCode: dto.serviceCode } },
      }),
      this.prisma.servicePricingTier.findUnique({ where: { serviceCode: dto.serviceCode } }),
    ]);

    if (!service) throw new NotFoundException('Service not found');

    const baseCost = Number(service.baseCostPerUnit);
    const partnerRate = partnerPricing ? Number(partnerPricing.pricePerUnit) : baseCost * 1.2;
    const customerRate = customerPricing ? Number(customerPricing.customerPricePerUnit) : partnerRate * 1.25;

    const units = dto.units;
    const costToYou = baseCost * units;
    const chargedToPartner = partnerRate * units;
    const chargedToCustomers = customerRate * units;
    const yourProfit = chargedToPartner - costToYou;
    const partnerProfit = chargedToCustomers - chargedToPartner;

    const period = this.getCurrentPeriod();

    const existing = await this.prisma.partnerUsageLog.findUnique({
      where: { partnerId_serviceCode_period: { partnerId: dto.partnerId, serviceCode: dto.serviceCode, period } },
    });

    if (existing) {
      return this.prisma.partnerUsageLog.update({
        where: { partnerId_serviceCode_period: { partnerId: dto.partnerId, serviceCode: dto.serviceCode, period } },
        data: {
          totalUnitsConsumed: { increment: dto.units },
          totalCostToYou: { increment: costToYou },
          totalChargedToPartner: { increment: chargedToPartner },
          totalChargedToCustomers: { increment: chargedToCustomers },
          yourProfit: { increment: yourProfit },
          partnerProfit: { increment: partnerProfit },
        },
      });
    }

    return this.prisma.partnerUsageLog.create({
      data: {
        partnerId: dto.partnerId,
        serviceCode: dto.serviceCode,
        period,
        totalUnitsConsumed: dto.units,
        totalCostToYou: costToYou,
        totalChargedToPartner: chargedToPartner,
        totalChargedToCustomers: chargedToCustomers,
        yourProfit: yourProfit,
        partnerProfit: partnerProfit,
      },
    });
  }

  async getUsageSummary(partnerId: string, period?: string) {
    const p = period || this.getCurrentPeriod();
    const logs = await this.prisma.partnerUsageLog.findMany({
      where: { partnerId, period: p },
      include: { partner: { select: { companyName: true } } },
    });
    const totals = logs.reduce(
      (acc, l) => ({
        totalCostToYou: acc.totalCostToYou + Number(l.totalCostToYou),
        totalChargedToPartner: acc.totalChargedToPartner + Number(l.totalChargedToPartner),
        totalChargedToCustomers: acc.totalChargedToCustomers + Number(l.totalChargedToCustomers),
        yourProfit: acc.yourProfit + Number(l.yourProfit),
        partnerProfit: acc.partnerProfit + Number(l.partnerProfit),
      }),
      { totalCostToYou: 0, totalChargedToPartner: 0, totalChargedToCustomers: 0, yourProfit: 0, partnerProfit: 0 },
    );
    return { partnerId, period: p, services: logs, totals };
  }

  private async getNextInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.partnerInvoice.count({
      where: { invoiceNumber: { startsWith: `WL-INV-${year}` } },
    });
    return `WL-INV-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  async generateInvoice(partnerId: string, period: string) {
    const partner = await this.prisma.whiteLabelPartner.findUnique({ where: { id: partnerId } });
    if (!partner) throw new NotFoundException('Partner not found');

    const existing = await this.prisma.partnerInvoice.findFirst({ where: { partnerId, period } });
    if (existing) throw new BadRequestException(`Invoice for ${period} already exists`);

    const usage = await this.getUsageSummary(partnerId, period);
    const lineItems = usage.services.map((s) => ({
      serviceCode: s.serviceCode,
      units: Number(s.totalUnitsConsumed),
      ratePerUnit: Number(s.totalChargedToPartner) / (Number(s.totalUnitsConsumed) || 1),
      amount: Number(s.totalChargedToPartner),
    }));

    const subtotal = usage.totals.totalChargedToPartner;
    const gstAmount = subtotal * 0.18;
    const totalAmount = subtotal + gstAmount;
    const invoiceNumber = await this.getNextInvoiceNumber();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 15);

    const invoice = await this.prisma.partnerInvoice.create({
      data: {
        partnerId,
        period,
        invoiceNumber,
        lineItems,
        subtotal,
        gstAmount,
        totalAmount,
        status: 'DRAFT',
        dueDate,
      },
    });

    await this.audit.log({
      partnerId,
      action: 'INVOICE_GENERATED',
      performedBy: 'system',
      performedByRole: 'MASTER_ADMIN',
      details: { invoiceNumber, totalAmount },
    });
    return invoice;
  }

  async sendInvoice(invoiceId: string) {
    const invoice = await this.prisma.partnerInvoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) throw new NotFoundException('Invoice not found');
    if (invoice.status !== 'DRAFT') throw new BadRequestException('Only DRAFT invoices can be sent');
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 15);
    return this.prisma.partnerInvoice.update({ where: { id: invoiceId }, data: { status: 'SENT', dueDate } });
  }

  async markPaid(invoiceId: string, razorpayPaymentId?: string) {
    const invoice = await this.prisma.partnerInvoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) throw new NotFoundException('Invoice not found');
    if (!['SENT', 'OVERDUE'].includes(invoice.status)) {
      throw new BadRequestException('Invoice must be SENT or OVERDUE to mark as paid');
    }
    return this.prisma.partnerInvoice.update({
      where: { id: invoiceId },
      data: { status: 'PAID', paidAt: new Date(), razorpayPaymentId },
    });
  }

  async getPartnerInvoices(partnerId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.partnerInvoice.findMany({ where: { partnerId }, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.partnerInvoice.count({ where: { partnerId } }),
    ]);
    return { data, meta: { total, page, limit } };
  }

  async getInvoice(invoiceId: string) {
    const invoice = await this.prisma.partnerInvoice.findUnique({
      where: { id: invoiceId },
      include: { partner: { select: { companyName: true, email: true, billingAddress: true } } },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  async getBillingDashboard() {
    const [totalRevenue, pending, paid, overdue] = await Promise.all([
      this.prisma.partnerInvoice.aggregate({ _sum: { totalAmount: true }, where: { status: 'PAID' } }),
      this.prisma.partnerInvoice.aggregate({ _sum: { totalAmount: true }, where: { status: 'SENT' } }),
      this.prisma.partnerInvoice.count({ where: { status: 'PAID' } }),
      this.prisma.partnerInvoice.count({ where: { status: 'OVERDUE' } }),
    ]);
    return {
      totalRevenue: Number(totalRevenue._sum.totalAmount || 0),
      pendingAmount: Number(pending._sum.totalAmount || 0),
      paidInvoices: paid,
      overdueInvoices: overdue,
    };
  }
}
