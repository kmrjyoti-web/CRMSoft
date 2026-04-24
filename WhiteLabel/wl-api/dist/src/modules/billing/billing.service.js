"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
let BillingService = class BillingService {
    prisma;
    audit;
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    getCurrentPeriod() {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }
    async recordUsage(dto) {
        const partner = await this.prisma.whiteLabelPartner.findUnique({ where: { id: dto.partnerId } });
        if (!partner)
            throw new common_1.NotFoundException('Partner not found');
        const [partnerPricing, customerPricing, service] = await Promise.all([
            this.prisma.partnerServicePricing.findUnique({
                where: { partnerId_serviceCode: { partnerId: dto.partnerId, serviceCode: dto.serviceCode } },
            }),
            this.prisma.partnerCustomerPricing.findUnique({
                where: { partnerId_serviceCode: { partnerId: dto.partnerId, serviceCode: dto.serviceCode } },
            }),
            this.prisma.servicePricingTier.findUnique({ where: { serviceCode: dto.serviceCode } }),
        ]);
        if (!service)
            throw new common_1.NotFoundException('Service not found');
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
    async getUsageSummary(partnerId, period) {
        const p = period || this.getCurrentPeriod();
        const logs = await this.prisma.partnerUsageLog.findMany({
            where: { partnerId, period: p },
            include: { partner: { select: { companyName: true } } },
        });
        const totals = logs.reduce((acc, l) => ({
            totalCostToYou: acc.totalCostToYou + Number(l.totalCostToYou),
            totalChargedToPartner: acc.totalChargedToPartner + Number(l.totalChargedToPartner),
            totalChargedToCustomers: acc.totalChargedToCustomers + Number(l.totalChargedToCustomers),
            yourProfit: acc.yourProfit + Number(l.yourProfit),
            partnerProfit: acc.partnerProfit + Number(l.partnerProfit),
        }), { totalCostToYou: 0, totalChargedToPartner: 0, totalChargedToCustomers: 0, yourProfit: 0, partnerProfit: 0 });
        return { partnerId, period: p, services: logs, totals };
    }
    async getNextInvoiceNumber() {
        const year = new Date().getFullYear();
        const count = await this.prisma.partnerInvoice.count({
            where: { invoiceNumber: { startsWith: `WL-INV-${year}` } },
        });
        return `WL-INV-${year}-${String(count + 1).padStart(4, '0')}`;
    }
    async generateInvoice(partnerId, period) {
        const partner = await this.prisma.whiteLabelPartner.findUnique({ where: { id: partnerId } });
        if (!partner)
            throw new common_1.NotFoundException('Partner not found');
        const existing = await this.prisma.partnerInvoice.findFirst({ where: { partnerId, period } });
        if (existing)
            throw new common_1.BadRequestException(`Invoice for ${period} already exists`);
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
    async sendInvoice(invoiceId) {
        const invoice = await this.prisma.partnerInvoice.findUnique({ where: { id: invoiceId } });
        if (!invoice)
            throw new common_1.NotFoundException('Invoice not found');
        if (invoice.status !== 'DRAFT')
            throw new common_1.BadRequestException('Only DRAFT invoices can be sent');
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 15);
        return this.prisma.partnerInvoice.update({ where: { id: invoiceId }, data: { status: 'SENT', dueDate } });
    }
    async markPaid(invoiceId, razorpayPaymentId) {
        const invoice = await this.prisma.partnerInvoice.findUnique({ where: { id: invoiceId } });
        if (!invoice)
            throw new common_1.NotFoundException('Invoice not found');
        if (!['SENT', 'OVERDUE'].includes(invoice.status)) {
            throw new common_1.BadRequestException('Invoice must be SENT or OVERDUE to mark as paid');
        }
        return this.prisma.partnerInvoice.update({
            where: { id: invoiceId },
            data: { status: 'PAID', paidAt: new Date(), razorpayPaymentId },
        });
    }
    async getPartnerInvoices(partnerId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.partnerInvoice.findMany({ where: { partnerId }, skip, take: limit, orderBy: { createdAt: 'desc' } }),
            this.prisma.partnerInvoice.count({ where: { partnerId } }),
        ]);
        return { data, meta: { total, page, limit } };
    }
    async getInvoice(invoiceId) {
        const invoice = await this.prisma.partnerInvoice.findUnique({
            where: { id: invoiceId },
            include: { partner: { select: { companyName: true, email: true, billingAddress: true } } },
        });
        if (!invoice)
            throw new common_1.NotFoundException('Invoice not found');
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
};
exports.BillingService = BillingService;
exports.BillingService = BillingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, audit_service_1.AuditService])
], BillingService);
//# sourceMappingURL=billing.service.js.map