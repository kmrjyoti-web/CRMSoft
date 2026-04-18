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
exports.UnitService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let UnitService = class UnitService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(tenantId, category) {
        const where = { tenantId };
        if (category)
            where.unitCategory = category;
        return this.prisma.working.unitMaster.findMany({
            where,
            orderBy: [{ unitCategory: 'asc' }, { name: 'asc' }],
        });
    }
    async getById(tenantId, id) {
        const unit = await this.prisma.working.unitMaster.findFirst({ where: { id, tenantId } });
        if (!unit)
            throw new common_1.NotFoundException('Unit not found');
        return unit;
    }
    async create(tenantId, dto) {
        const existing = await this.prisma.working.unitMaster.findUnique({
            where: { tenantId_symbol: { tenantId, symbol: dto.symbol } },
        });
        if (existing)
            throw new common_1.BadRequestException(`Unit "${dto.symbol}" already exists`);
        return this.prisma.working.unitMaster.create({
            data: {
                tenantId,
                name: dto.name,
                symbol: dto.symbol,
                unitCategory: dto.category,
                isBase: dto.isBaseUnit ?? false,
            },
        });
    }
    async update(tenantId, id, dto) {
        const unit = await this.prisma.working.unitMaster.findFirst({ where: { id, tenantId } });
        if (!unit)
            throw new common_1.NotFoundException('Unit not found');
        return this.prisma.working.unitMaster.update({ where: { id }, data: dto });
    }
    async delete(tenantId, id) {
        const unit = await this.prisma.working.unitMaster.findFirst({ where: { id, tenantId } });
        if (!unit)
            throw new common_1.NotFoundException('Unit not found');
        if (unit.isSystem)
            throw new common_1.BadRequestException('Cannot delete system unit');
        await this.prisma.working.unitMaster.delete({ where: { id } });
        return { deleted: true };
    }
    async listConversions(tenantId, productId) {
        const where = { tenantId };
        if (productId)
            where.productId = productId;
        else
            where.productId = null;
        return this.prisma.working.unitConversion.findMany({ where });
    }
    async createConversion(tenantId, dto) {
        return this.prisma.working.unitConversion.create({
            data: {
                tenantId,
                fromUnitId: dto.fromUnitId,
                toUnitId: dto.toUnitId,
                conversionFactor: dto.factor,
                productId: dto.productId,
            },
        });
    }
    async deleteConversion(tenantId, id) {
        const conv = await this.prisma.working.unitConversion.findFirst({ where: { id, tenantId } });
        if (!conv)
            throw new common_1.NotFoundException('Conversion not found');
        await this.prisma.working.unitConversion.delete({ where: { id } });
        return { deleted: true };
    }
    async calculate(tenantId, dto) {
        if (dto.fromUnitId === dto.toUnitId) {
            return { result: dto.quantity, factor: 1 };
        }
        let conversion = dto.productId
            ? await this.prisma.working.unitConversion.findFirst({
                where: { tenantId, fromUnitId: dto.fromUnitId, toUnitId: dto.toUnitId, productId: dto.productId },
            })
            : null;
        if (!conversion) {
            conversion = await this.prisma.working.unitConversion.findFirst({
                where: { tenantId, fromUnitId: dto.fromUnitId, toUnitId: dto.toUnitId, productId: null },
            });
        }
        if (!conversion) {
            const reverse = await this.prisma.working.unitConversion.findFirst({
                where: { tenantId, fromUnitId: dto.toUnitId, toUnitId: dto.fromUnitId },
            });
            if (reverse) {
                const factor = 1 / reverse.conversionFactor.toNumber();
                return { result: dto.quantity * factor, factor };
            }
        }
        if (!conversion) {
            throw new common_1.BadRequestException('No conversion found between these units');
        }
        const factor = conversion.conversionFactor.toNumber();
        return { result: dto.quantity * factor, factor };
    }
};
exports.UnitService = UnitService;
exports.UnitService = UnitService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UnitService);
//# sourceMappingURL=unit.service.js.map