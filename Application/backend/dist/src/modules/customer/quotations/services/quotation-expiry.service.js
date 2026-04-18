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
var QuotationExpiryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuotationExpiryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let QuotationExpiryService = QuotationExpiryService_1 = class QuotationExpiryService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(QuotationExpiryService_1.name);
    }
    async checkExpiry() {
        const now = new Date();
        const expiredQuotations = await this.prisma.working.quotation.findMany({
            where: {
                status: { in: ['SENT', 'VIEWED', 'NEGOTIATION'] },
                validUntil: { lt: now },
            },
            select: { id: true, quotationNo: true, status: true },
        });
        if (expiredQuotations.length === 0)
            return;
        for (const q of expiredQuotations) {
            await this.prisma.working.quotation.update({
                where: { id: q.id },
                data: { status: 'EXPIRED' },
            });
            await this.prisma.working.quotationActivity.create({
                data: {
                    quotationId: q.id,
                    action: 'EXPIRED',
                    description: `Quotation ${q.quotationNo} expired — validity period ended`,
                    previousValue: q.status,
                    newValue: 'EXPIRED',
                    changedField: 'status',
                    performedById: 'SYSTEM',
                    performedByName: 'System',
                },
            });
        }
        this.logger.log(`Expired ${expiredQuotations.length} quotation(s)`);
    }
};
exports.QuotationExpiryService = QuotationExpiryService;
exports.QuotationExpiryService = QuotationExpiryService = QuotationExpiryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], QuotationExpiryService);
//# sourceMappingURL=quotation-expiry.service.js.map