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
exports.BOMFormulaService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let BOMFormulaService = class BOMFormulaService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(tenantId, data) {
        const code = data.formulaCode || await this.generateCode(tenantId);
        const existing = await this.prisma.working.bOMFormula.findFirst({
            where: { tenantId, formulaCode: code },
        });
        if (existing)
            throw new common_1.BadRequestException(`Formula code "${code}" already exists`);
        const formula = await this.prisma.working.bOMFormula.create({
            data: {
                tenantId,
                formulaName: data.formulaName,
                formulaCode: code,
                finishedProductId: data.finishedProductId,
                yieldQuantity: data.yieldQuantity ?? 1,
                yieldUnit: data.yieldUnit ?? 'piece',
                prepTime: data.prepTime,
                cookTime: data.cookTime,
                instructions: data.instructions,
                industryCode: data.industryCode,
                items: {
                    create: data.items.map((item, idx) => {
                        const wastage = item.wastagePercent ?? 0;
                        const effectiveQty = item.quantity * (1 + wastage / 100);
                        return {
                            tenantId,
                            rawMaterialId: item.rawMaterialId,
                            quantity: item.quantity,
                            unit: item.unit,
                            wastagePercent: wastage,
                            effectiveQuantity: Math.round(effectiveQty * 1000) / 1000,
                            isCritical: item.isCritical ?? true,
                            substituteProductId: item.substituteProductId,
                            sortOrder: item.sortOrder ?? idx,
                        };
                    }),
                },
            },
            include: { items: true, finishedProduct: true },
        });
        await this.prisma.working.inventoryItem.updateMany({
            where: { id: data.finishedProductId, tenantId },
            data: { isFinishedProduct: true },
        });
        const rawMaterialIds = data.items.map((i) => i.rawMaterialId);
        await this.prisma.working.inventoryItem.updateMany({
            where: { id: { in: rawMaterialIds }, tenantId },
            data: { isRawMaterial: true },
        });
        return formula;
    }
    async findAll(tenantId, filters) {
        const where = { tenantId };
        if (filters?.productId)
            where.finishedProductId = filters.productId;
        if (filters?.industryCode)
            where.industryCode = filters.industryCode;
        if (filters?.isActive !== undefined)
            where.isActive = filters.isActive;
        if (filters?.search) {
            where.OR = [
                { formulaName: { contains: filters.search, mode: 'insensitive' } },
                { formulaCode: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        return this.prisma.working.bOMFormula.findMany({
            where,
            include: {
                items: { orderBy: { sortOrder: 'asc' } },
                finishedProduct: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findById(tenantId, id) {
        const formula = await this.prisma.working.bOMFormula.findFirst({
            where: { id, tenantId },
            include: {
                items: {
                    orderBy: { sortOrder: 'asc' },
                    include: { rawMaterial: true },
                },
                finishedProduct: true,
            },
        });
        if (!formula)
            throw new common_1.NotFoundException('Recipe not found');
        const enrichedItems = await Promise.all(formula.items.map(async (item) => {
            const summaries = await this.prisma.working.stockSummary.findMany({
                where: { tenantId, inventoryItemId: item.rawMaterialId },
            });
            const totalStock = summaries.reduce((sum, s) => sum + s.currentStock, 0);
            return {
                ...item,
                currentStock: totalStock,
            };
        }));
        return { ...formula, items: enrichedItems };
    }
    async update(tenantId, id, data) {
        const existing = await this.prisma.working.bOMFormula.findFirst({
            where: { id, tenantId },
        });
        if (!existing)
            throw new common_1.NotFoundException('Recipe not found');
        if (data.items) {
            await this.prisma.working.bOMFormula.update({
                where: { id },
                data: { isActive: false },
            });
            const newVersion = existing.version + 1;
            const newCode = `${existing.formulaCode}-v${newVersion}`;
            return this.create(tenantId, {
                formulaName: data.formulaName ?? existing.formulaName,
                formulaCode: newCode,
                finishedProductId: existing.finishedProductId,
                yieldQuantity: data.yieldQuantity ?? Number(existing.yieldQuantity),
                yieldUnit: data.yieldUnit ?? existing.yieldUnit,
                prepTime: data.prepTime ?? existing.prepTime ?? undefined,
                cookTime: data.cookTime ?? existing.cookTime ?? undefined,
                instructions: data.instructions ?? existing.instructions ?? undefined,
                industryCode: data.industryCode ?? existing.industryCode ?? undefined,
                items: data.items,
            });
        }
        const updateData = {};
        if (data.formulaName)
            updateData.formulaName = data.formulaName;
        if (data.yieldQuantity)
            updateData.yieldQuantity = data.yieldQuantity;
        if (data.yieldUnit)
            updateData.yieldUnit = data.yieldUnit;
        if (data.prepTime !== undefined)
            updateData.prepTime = data.prepTime;
        if (data.cookTime !== undefined)
            updateData.cookTime = data.cookTime;
        if (data.instructions !== undefined)
            updateData.instructions = data.instructions;
        if (data.industryCode)
            updateData.industryCode = data.industryCode;
        return this.prisma.working.bOMFormula.update({
            where: { id },
            data: updateData,
            include: { items: { orderBy: { sortOrder: 'asc' } }, finishedProduct: true },
        });
    }
    async duplicate(tenantId, id, newName) {
        const original = await this.prisma.working.bOMFormula.findFirst({
            where: { id, tenantId },
            include: { items: true },
        });
        if (!original)
            throw new common_1.NotFoundException('Recipe not found');
        return this.create(tenantId, {
            formulaName: newName,
            finishedProductId: original.finishedProductId,
            yieldQuantity: Number(original.yieldQuantity),
            yieldUnit: original.yieldUnit,
            prepTime: original.prepTime ?? undefined,
            cookTime: original.cookTime ?? undefined,
            instructions: original.instructions ?? undefined,
            industryCode: original.industryCode ?? undefined,
            items: original.items.map((item) => ({
                rawMaterialId: item.rawMaterialId,
                quantity: Number(item.quantity),
                unit: item.unit,
                wastagePercent: item.wastagePercent ? Number(item.wastagePercent) : undefined,
                isCritical: item.isCritical,
                substituteProductId: item.substituteProductId ?? undefined,
                sortOrder: item.sortOrder,
            })),
        });
    }
    async deactivate(tenantId, id) {
        const formula = await this.prisma.working.bOMFormula.findFirst({ where: { id, tenantId } });
        if (!formula)
            throw new common_1.NotFoundException('Recipe not found');
        return this.prisma.working.bOMFormula.update({
            where: { id },
            data: { isActive: false },
        });
    }
    async generateCode(tenantId) {
        const count = await this.prisma.working.bOMFormula.count({ where: { tenantId } });
        return `BOM-${String(count + 1).padStart(4, '0')}`;
    }
};
exports.BOMFormulaService = BOMFormulaService;
exports.BOMFormulaService = BOMFormulaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BOMFormulaService);
//# sourceMappingURL=bom-formula.service.js.map