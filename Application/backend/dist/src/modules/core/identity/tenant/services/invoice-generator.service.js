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
var InvoiceGeneratorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceGeneratorService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
let InvoiceGeneratorService = InvoiceGeneratorService_1 = class InvoiceGeneratorService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(InvoiceGeneratorService_1.name);
    }
    async generate(data) {
        const invoiceNumber = `INV-${Date.now()}`;
        const total = data.amount + data.tax;
        const invoice = await this.prisma.identity.tenantInvoice.create({
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
    async generatePdf(invoiceId) {
        this.logger.log(`Generating PDF for invoice ${invoiceId}`);
        const pdfUrl = `/invoices/${invoiceId}.pdf`;
        await this.prisma.identity.tenantInvoice.update({
            where: { id: invoiceId },
            data: { pdfUrl },
        });
        return pdfUrl;
    }
};
exports.InvoiceGeneratorService = InvoiceGeneratorService;
exports.InvoiceGeneratorService = InvoiceGeneratorService = InvoiceGeneratorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InvoiceGeneratorService);
//# sourceMappingURL=invoice-generator.service.js.map