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
exports.PublicOrganizationsController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const api_key_guard_1 = require("../guards/api-key.guard");
const api_scope_guard_1 = require("../guards/api-scope.guard");
const api_rate_limit_guard_1 = require("../guards/api-rate-limit.guard");
const api_scopes_decorator_1 = require("../decorators/api-scopes.decorator");
const public_api_dto_1 = require("./dto/public-api.dto");
let PublicOrganizationsController = class PublicOrganizationsController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(req, query) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const where = { tenantId: req.tenantId, isActive: true };
        if (query.search) {
            where.name = { contains: query.search, mode: 'insensitive' };
        }
        const [data, total] = await Promise.all([
            this.prisma.working.organization.findMany({
                where,
                orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                select: {
                    id: true, name: true, industry: true, website: true,
                    gstNumber: true, orgType: true, address: true,
                    city: true, state: true, country: true, pincode: true,
                    isActive: true, createdAt: true, updatedAt: true,
                },
            }),
            this.prisma.working.organization.count({ where }),
        ]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async getById(req, id) {
        const org = await this.prisma.working.organization.findFirst({
            where: { id, tenantId: req.tenantId, isActive: true },
        });
        if (!org)
            throw new Error('Organization not found');
        return org;
    }
    async create(req, body) {
        return this.prisma.working.organization.create({
            data: {
                tenantId: req.tenantId,
                name: body.name,
                industry: body.industry,
                website: body.website,
                gstNumber: body.gstNumber,
                orgType: body.orgType,
                address: body.address,
                city: body.city,
                state: body.state,
                country: body.country,
                pincode: body.pincode,
                notes: body.notes,
                createdById: body.createdById || req.apiKeyId,
            },
        });
    }
    async update(req, id, body) {
        await this.prisma.working.organization.findFirstOrThrow({
            where: { id, tenantId: req.tenantId, isActive: true },
        });
        const updateData = {};
        if (body.name !== undefined)
            updateData.name = body.name;
        if (body.industry !== undefined)
            updateData.industry = body.industry;
        if (body.website !== undefined)
            updateData.website = body.website;
        if (body.gstNumber !== undefined)
            updateData.gstNumber = body.gstNumber;
        if (body.address !== undefined)
            updateData.address = body.address;
        if (body.city !== undefined)
            updateData.city = body.city;
        if (body.state !== undefined)
            updateData.state = body.state;
        if (body.country !== undefined)
            updateData.country = body.country;
        if (body.pincode !== undefined)
            updateData.pincode = body.pincode;
        if (body.notes !== undefined)
            updateData.notes = body.notes;
        return this.prisma.working.organization.update({ where: { id }, data: updateData });
    }
};
exports.PublicOrganizationsController = PublicOrganizationsController;
__decorate([
    (0, common_1.Get)(),
    (0, api_scopes_decorator_1.ApiScopes)('organizations:read'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, public_api_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", Promise)
], PublicOrganizationsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, api_scopes_decorator_1.ApiScopes)('organizations:read'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PublicOrganizationsController.prototype, "getById", null);
__decorate([
    (0, common_1.Post)(),
    (0, api_scopes_decorator_1.ApiScopes)('organizations:write'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PublicOrganizationsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, api_scopes_decorator_1.ApiScopes)('organizations:write'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], PublicOrganizationsController.prototype, "update", null);
exports.PublicOrganizationsController = PublicOrganizationsController = __decorate([
    (0, common_1.Controller)('public/organizations'),
    (0, common_1.UseGuards)(api_key_guard_1.ApiKeyGuard, api_scope_guard_1.ApiScopeGuard, api_rate_limit_guard_1.ApiRateLimitGuard),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PublicOrganizationsController);
//# sourceMappingURL=public-organizations.controller.js.map