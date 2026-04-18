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
var GetQuotationVersionsHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetQuotationVersionsHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_quotation_versions_query_1 = require("./get-quotation-versions.query");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let GetQuotationVersionsHandler = GetQuotationVersionsHandler_1 = class GetQuotationVersionsHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetQuotationVersionsHandler_1.name);
    }
    async execute(query) {
        try {
            const quotation = await this.prisma.working.quotation.findUnique({
                where: { id: query.quotationId },
                select: { id: true, parentQuotationId: true },
            });
            if (!quotation)
                throw new common_1.NotFoundException('Quotation not found');
            let rootId = quotation.id;
            let current = quotation;
            while (current.parentQuotationId) {
                const parent = await this.prisma.working.quotation.findUnique({
                    where: { id: current.parentQuotationId },
                    select: { id: true, parentQuotationId: true },
                });
                if (!parent)
                    break;
                rootId = parent.id;
                current = parent;
            }
            const versions = await this.collectVersions(rootId);
            return versions;
        }
        catch (error) {
            this.logger.error(`GetQuotationVersionsHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
    async collectVersions(id) {
        const q = await this.prisma.working.quotation.findUnique({
            where: { id },
            select: {
                id: true, quotationNo: true, version: true, status: true,
                totalAmount: true, createdAt: true,
                revisions: {
                    select: { id: true, quotationNo: true, version: true, status: true, totalAmount: true, createdAt: true },
                    orderBy: { version: 'asc' },
                },
            },
        });
        if (!q)
            return [];
        const result = [{ id: q.id, quotationNo: q.quotationNo, version: q.version, status: q.status, totalAmount: q.totalAmount, createdAt: q.createdAt }];
        for (const rev of q.revisions) {
            result.push(rev);
        }
        return result;
    }
};
exports.GetQuotationVersionsHandler = GetQuotationVersionsHandler;
exports.GetQuotationVersionsHandler = GetQuotationVersionsHandler = GetQuotationVersionsHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_quotation_versions_query_1.GetQuotationVersionsQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetQuotationVersionsHandler);
//# sourceMappingURL=get-quotation-versions.handler.js.map