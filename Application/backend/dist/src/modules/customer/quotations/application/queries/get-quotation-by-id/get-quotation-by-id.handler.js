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
var GetQuotationByIdHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetQuotationByIdHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_quotation_by_id_query_1 = require("./get-quotation-by-id.query");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let GetQuotationByIdHandler = GetQuotationByIdHandler_1 = class GetQuotationByIdHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetQuotationByIdHandler_1.name);
    }
    async execute(query) {
        try {
            const quotation = await this.prisma.working.quotation.findUnique({
                where: { id: query.id },
                include: {
                    lineItems: { orderBy: { sortOrder: 'asc' } },
                    sendLogs: { orderBy: { sentAt: 'desc' } },
                    negotiations: { orderBy: { loggedAt: 'desc' } },
                    activities: { orderBy: { createdAt: 'desc' }, take: 20 },
                    lead: { include: { contact: true, organization: true } },
                    contactPerson: { select: { id: true, firstName: true, lastName: true } },
                    organization: { select: { id: true, name: true } },
                    parentQuotation: { select: { id: true, quotationNo: true, status: true } },
                    revisions: { select: { id: true, quotationNo: true, version: true, status: true } },
                    createdByUser: { select: { id: true, firstName: true, lastName: true } },
                },
            });
            if (!quotation)
                throw new common_1.NotFoundException('Quotation not found');
            return quotation;
        }
        catch (error) {
            this.logger.error(`GetQuotationByIdHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetQuotationByIdHandler = GetQuotationByIdHandler;
exports.GetQuotationByIdHandler = GetQuotationByIdHandler = GetQuotationByIdHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_quotation_by_id_query_1.GetQuotationByIdQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetQuotationByIdHandler);
//# sourceMappingURL=get-quotation-by-id.handler.js.map