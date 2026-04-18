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
var UpdateProductHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProductHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const update_product_command_1 = require("./update-product.command");
let UpdateProductHandler = UpdateProductHandler_1 = class UpdateProductHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(UpdateProductHandler_1.name);
    }
    async execute(command) {
        try {
            const { id, data } = command;
            const existing = await this.prisma.working.product.findUnique({ where: { id } });
            if (!existing) {
                throw new common_1.NotFoundException(`Product "${id}" not found`);
            }
            const updateData = { ...data };
            if (data.name && data.name !== existing.name) {
                updateData.slug = await this.generateUniqueSlug(data.name, id);
            }
            if (data.parentId !== undefined) {
                if (data.parentId === id) {
                    throw new common_1.BadRequestException('Product cannot be its own parent');
                }
                if (data.parentId) {
                    const isChild = await this.isDescendant(data.parentId, id);
                    if (isChild) {
                        throw new common_1.BadRequestException('Circular reference: target parent is a child of this product');
                    }
                }
            }
            if (updateData.taxType)
                updateData.taxType = updateData.taxType;
            if (updateData.primaryUnit)
                updateData.primaryUnit = updateData.primaryUnit;
            if (updateData.secondaryUnit)
                updateData.secondaryUnit = updateData.secondaryUnit;
            if (updateData.packingUnit)
                updateData.packingUnit = updateData.packingUnit;
            const product = await this.prisma.working.product.update({
                where: { id },
                data: updateData,
            });
            if (data.gstRate !== undefined) {
                await this.prisma.working.productTaxDetail.deleteMany({
                    where: { productId: id },
                });
                if (data.gstRate != null) {
                    const halfRate = data.gstRate / 2;
                    const entries = [
                        { productId: id, taxName: 'CGST', taxRate: halfRate, description: 'Central GST' },
                        { productId: id, taxName: 'SGST', taxRate: halfRate, description: 'State GST' },
                    ];
                    if (data.cessRate && data.cessRate > 0) {
                        entries.push({
                            productId: id,
                            taxName: 'CESS',
                            taxRate: data.cessRate,
                            description: 'Compensation Cess',
                        });
                    }
                    await this.prisma.working.productTaxDetail.createMany({ data: entries });
                }
            }
            this.logger.log(`Product updated: ${product.id}`);
            return product;
        }
        catch (error) {
            this.logger.error(`UpdateProductHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
    async generateUniqueSlug(name, excludeId) {
        const base = name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/[\s]+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        let slug = base;
        let suffix = 1;
        while (true) {
            const found = await this.prisma.working.product.findFirst({ where: { slug } });
            if (!found || found.id === excludeId)
                break;
            suffix++;
            slug = `${base}-${suffix}`;
        }
        return slug;
    }
    async isDescendant(candidateId, ancestorId) {
        const children = await this.prisma.working.product.findMany({
            where: { parentId: ancestorId },
            select: { id: true },
        });
        for (const child of children) {
            if (child.id === candidateId)
                return true;
            const found = await this.isDescendant(candidateId, child.id);
            if (found)
                return true;
        }
        return false;
    }
};
exports.UpdateProductHandler = UpdateProductHandler;
exports.UpdateProductHandler = UpdateProductHandler = UpdateProductHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(update_product_command_1.UpdateProductCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UpdateProductHandler);
//# sourceMappingURL=update-product.handler.js.map