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
exports.PublicContactsController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const api_key_guard_1 = require("../guards/api-key.guard");
const api_scope_guard_1 = require("../guards/api-scope.guard");
const api_rate_limit_guard_1 = require("../guards/api-rate-limit.guard");
const api_scopes_decorator_1 = require("../decorators/api-scopes.decorator");
const public_api_dto_1 = require("./dto/public-api.dto");
let PublicContactsController = class PublicContactsController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(req, query) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const where = { tenantId: req.tenantId, isActive: true };
        if (query.search) {
            where.OR = [
                { firstName: { contains: query.search, mode: 'insensitive' } },
                { lastName: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        const [data, total] = await Promise.all([
            this.prisma.working.contact.findMany({
                where,
                orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                select: {
                    id: true, firstName: true, lastName: true,
                    designation: true, department: true, isActive: true,
                    createdAt: true, updatedAt: true,
                    organization: { select: { id: true, name: true } },
                },
            }),
            this.prisma.working.contact.count({ where }),
        ]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async getById(req, id) {
        const contact = await this.prisma.working.contact.findFirst({
            where: { id, tenantId: req.tenantId, isActive: true },
            include: {
                organization: { select: { id: true, name: true } },
            },
        });
        if (!contact)
            throw new Error('Contact not found');
        return contact;
    }
    async create(req, body) {
        return this.prisma.working.contact.create({
            data: {
                tenantId: req.tenantId,
                firstName: body.firstName,
                lastName: body.lastName || '',
                designation: body.designation,
                department: body.department,
                notes: body.notes,
                organizationId: body.organizationId,
                createdById: body.createdById || req.apiKeyId,
            },
        });
    }
    async update(req, id, body) {
        await this.prisma.working.contact.findFirstOrThrow({
            where: { id, tenantId: req.tenantId, isActive: true },
        });
        const updateData = {};
        if (body.firstName !== undefined)
            updateData.firstName = body.firstName;
        if (body.lastName !== undefined)
            updateData.lastName = body.lastName;
        if (body.designation !== undefined)
            updateData.designation = body.designation;
        if (body.department !== undefined)
            updateData.department = body.department;
        if (body.notes !== undefined)
            updateData.notes = body.notes;
        if (body.organizationId !== undefined)
            updateData.organizationId = body.organizationId;
        return this.prisma.working.contact.update({ where: { id }, data: updateData });
    }
};
exports.PublicContactsController = PublicContactsController;
__decorate([
    (0, common_1.Get)(),
    (0, api_scopes_decorator_1.ApiScopes)('contacts:read'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, public_api_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", Promise)
], PublicContactsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, api_scopes_decorator_1.ApiScopes)('contacts:read'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PublicContactsController.prototype, "getById", null);
__decorate([
    (0, common_1.Post)(),
    (0, api_scopes_decorator_1.ApiScopes)('contacts:write'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PublicContactsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, api_scopes_decorator_1.ApiScopes)('contacts:write'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], PublicContactsController.prototype, "update", null);
exports.PublicContactsController = PublicContactsController = __decorate([
    (0, common_1.Controller)('public/contacts'),
    (0, common_1.UseGuards)(api_key_guard_1.ApiKeyGuard, api_scope_guard_1.ApiScopeGuard, api_rate_limit_guard_1.ApiRateLimitGuard),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PublicContactsController);
//# sourceMappingURL=public-contacts.controller.js.map