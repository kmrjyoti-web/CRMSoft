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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicQuotationsController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const api_key_guard_1 = require("../guards/api-key.guard");
const api_scope_guard_1 = require("../guards/api-scope.guard");
const api_rate_limit_guard_1 = require("../guards/api-rate-limit.guard");
const api_scopes_decorator_1 = require("../decorators/api-scopes.decorator");
const public_api_dto_1 = require("./dto/public-api.dto");
let PublicQuotationsController = class PublicQuotationsController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(req, query) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const [data, total] = await Promise.all([
            this.prisma.working.quotation.findMany({
                where: { tenantId: req.tenantId },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                select: {
                    id: true, quotationNo: true, title: true, status: true,
                    totalAmount: true, validUntil: true,
                    createdAt: true, updatedAt: true,
                },
            }),
            this.prisma.working.quotation.count({ where: { tenantId: req.tenantId } }),
        ]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async getById(req, id) {
        const quotation = await this.prisma.working.quotation.findFirst({
            where: { id, tenantId: req.tenantId },
            include: { lineItems: true },
        });
        if (!quotation)
            throw new Error('Quotation not found');
        return quotation;
    }
};
exports.PublicQuotationsController = PublicQuotationsController;
__decorate([
    (0, common_1.Get)(),
    (0, api_scopes_decorator_1.ApiScopes)('quotations:read'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, public_api_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", Promise)
], PublicQuotationsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, api_scopes_decorator_1.ApiScopes)('quotations:read'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PublicQuotationsController.prototype, "getById", null);
exports.PublicQuotationsController = PublicQuotationsController = __decorate([
    (0, common_1.Controller)('public/quotations'),
    (0, common_1.UseGuards)(api_key_guard_1.ApiKeyGuard, api_scope_guard_1.ApiScopeGuard, api_rate_limit_guard_1.ApiRateLimitGuard),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PublicQuotationsController);
//# sourceMappingURL=public-quotations.controller.js.map