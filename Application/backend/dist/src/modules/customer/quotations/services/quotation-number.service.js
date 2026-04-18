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
exports.QuotationNumberService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let QuotationNumberService = class QuotationNumberService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateNumber(tenantId) {
        const year = new Date().getFullYear();
        const prefix = `QTN-${year}-`;
        const where = { quotationNo: { startsWith: prefix } };
        if (tenantId)
            where.tenantId = tenantId;
        const last = await this.prisma.working.quotation.findFirst({
            where,
            orderBy: { quotationNo: 'desc' },
            select: { quotationNo: true },
        });
        let seq = 1;
        if (last) {
            const parts = last.quotationNo.split('-');
            const lastSeq = parseInt(parts[parts.length - 1], 10);
            if (!isNaN(lastSeq))
                seq = lastSeq + 1;
        }
        return `${prefix}${String(seq).padStart(5, '0')}`;
    }
    generateRevisionNumber(parentNo, version) {
        const base = parentNo.replace(/-R\d+$/, '');
        return `${base}-R${version - 1}`;
    }
};
exports.QuotationNumberService = QuotationNumberService;
exports.QuotationNumberService = QuotationNumberService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], QuotationNumberService);
//# sourceMappingURL=quotation-number.service.js.map