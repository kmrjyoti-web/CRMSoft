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
exports.PrismaCustomerUserRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const customer_user_entity_1 = require("../../domain/entities/customer-user.entity");
const types_1 = require("../../../../common/types");
const paginated_type_1 = require("../../../../common/types/paginated.type");
let PrismaCustomerUserRepository = class PrismaCustomerUserRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    toEntity(record) {
        const props = {
            email: record.email,
            phone: record.phone ?? undefined,
            passwordHash: record.passwordHash,
            linkedEntityType: record.linkedEntityType,
            linkedEntityId: record.linkedEntityId,
            linkedEntityName: record.linkedEntityName,
            displayName: record.displayName,
            avatarUrl: record.avatarUrl ?? undefined,
            companyName: record.companyName ?? undefined,
            gstin: record.gstin ?? undefined,
            menuCategoryId: record.menuCategoryId ?? undefined,
            pageOverrides: record.pageOverrides ?? {},
            isActive: record.isActive,
            isFirstLogin: record.isFirstLogin,
            lastLoginAt: record.lastLoginAt ?? undefined,
            loginCount: record.loginCount,
            failedAttempts: record.failedAttempts,
            lockedUntil: record.lockedUntil ?? undefined,
            refreshToken: record.refreshToken ?? undefined,
            refreshTokenExp: record.refreshTokenExp ?? undefined,
            passwordResetToken: record.passwordResetToken ?? undefined,
            passwordResetExp: record.passwordResetExp ?? undefined,
            isDeleted: record.isDeleted,
            createdById: record.createdById,
        };
        return customer_user_entity_1.CustomerUserEntity.fromPersistence(record.id, record.tenantId, props, record.createdAt, record.updatedAt);
    }
    toCreateData(entity) {
        return {
            id: entity.id,
            tenantId: entity.tenantId,
            email: entity.email,
            phone: entity.phone ?? null,
            passwordHash: entity.passwordHash,
            linkedEntityType: entity.linkedEntityType,
            linkedEntityId: entity.linkedEntityId,
            linkedEntityName: entity.linkedEntityName,
            displayName: entity.displayName,
            avatarUrl: entity.avatarUrl ?? null,
            companyName: entity.companyName ?? null,
            gstin: entity.gstin ?? null,
            menuCategoryId: entity.menuCategoryId ?? null,
            pageOverrides: entity.pageOverrides,
            isActive: entity.isActive,
            isFirstLogin: entity.isFirstLogin,
            loginCount: entity.loginCount,
            failedAttempts: entity.failedAttempts,
            lockedUntil: entity.lockedUntil ?? null,
            refreshToken: entity.refreshToken ?? null,
            refreshTokenExp: entity.refreshTokenExp ?? null,
            passwordResetToken: entity.passwordResetToken ?? null,
            passwordResetExp: entity.passwordResetExp ?? null,
            isDeleted: entity.isDeleted,
            createdById: entity.createdById,
        };
    }
    async save(entity) {
        try {
            const record = await this.prisma.identity.customerUser.create({
                data: this.toCreateData(entity),
            });
            return (0, types_1.Ok)(this.toEntity(record));
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            if (msg.includes('Unique constraint')) {
                return (0, types_1.Err)('CP_010', 'A portal user with this email or linked entity already exists', 409);
            }
            return (0, types_1.Err)('CP_011', `Failed to save customer user: ${msg}`, 500);
        }
    }
    async findById(id) {
        const record = await this.prisma.identity.customerUser.findFirst({
            where: { id, isDeleted: false },
        });
        return record ? this.toEntity(record) : null;
    }
    async findByEmail(tenantId, email) {
        const record = await this.prisma.identity.customerUser.findFirst({
            where: { tenantId, email, isDeleted: false },
        });
        return record ? this.toEntity(record) : null;
    }
    async findByLinkedEntity(tenantId, entityType, entityId) {
        const record = await this.prisma.identity.customerUser.findFirst({
            where: { tenantId, linkedEntityType: entityType, linkedEntityId: entityId, isDeleted: false },
        });
        return record ? this.toEntity(record) : null;
    }
    async findByRefreshToken(token) {
        const record = await this.prisma.identity.customerUser.findFirst({
            where: { refreshToken: token, isDeleted: false },
        });
        return record ? this.toEntity(record) : null;
    }
    async findByPasswordResetToken(token) {
        const record = await this.prisma.identity.customerUser.findFirst({
            where: { passwordResetToken: token, isDeleted: false },
        });
        return record ? this.toEntity(record) : null;
    }
    async findAllByTenant(tenantId, options) {
        const { page, limit, search, isActive } = options;
        const skip = (page - 1) * limit;
        const where = {
            tenantId,
            isDeleted: false,
            ...(isActive !== undefined ? { isActive } : {}),
            ...(search
                ? {
                    OR: [
                        { displayName: { contains: search, mode: 'insensitive' } },
                        { email: { contains: search, mode: 'insensitive' } },
                        { linkedEntityName: { contains: search, mode: 'insensitive' } },
                    ],
                }
                : {}),
        };
        const [records, total] = await Promise.all([
            this.prisma.identity.customerUser.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
            this.prisma.identity.customerUser.count({ where }),
        ]);
        return (0, paginated_type_1.paginate)(records.map((r) => this.toEntity(r)), total, page, limit);
    }
    async update(entity) {
        try {
            const record = await this.prisma.identity.customerUser.update({
                where: { id: entity.id },
                data: {
                    email: entity.email,
                    phone: entity.phone ?? null,
                    passwordHash: entity.passwordHash,
                    displayName: entity.displayName,
                    avatarUrl: entity.avatarUrl ?? null,
                    companyName: entity.companyName ?? null,
                    gstin: entity.gstin ?? null,
                    menuCategoryId: entity.menuCategoryId ?? null,
                    pageOverrides: entity.pageOverrides,
                    isActive: entity.isActive,
                    isFirstLogin: entity.isFirstLogin,
                    lastLoginAt: entity.lastLoginAt ?? null,
                    loginCount: entity.loginCount,
                    failedAttempts: entity.failedAttempts,
                    lockedUntil: entity.lockedUntil ?? null,
                    refreshToken: entity.refreshToken ?? null,
                    refreshTokenExp: entity.refreshTokenExp ?? null,
                    passwordResetToken: entity.passwordResetToken ?? null,
                    passwordResetExp: entity.passwordResetExp ?? null,
                    isDeleted: entity.isDeleted,
                },
            });
            return (0, types_1.Ok)(this.toEntity(record));
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            return (0, types_1.Err)('CP_012', `Failed to update customer user: ${msg}`, 500);
        }
    }
    async softDelete(id) {
        try {
            await this.prisma.identity.customerUser.update({
                where: { id },
                data: { isDeleted: true, isActive: false },
            });
            return (0, types_1.Ok)(undefined);
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            return (0, types_1.Err)('CP_013', `Failed to delete customer user: ${msg}`, 500);
        }
    }
};
exports.PrismaCustomerUserRepository = PrismaCustomerUserRepository;
exports.PrismaCustomerUserRepository = PrismaCustomerUserRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaCustomerUserRepository);
//# sourceMappingURL=prisma-customer-user.repository.js.map