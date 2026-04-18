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
var CreateProductHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateProductHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const create_product_command_1 = require("./create-product.command");
let CreateProductHandler = CreateProductHandler_1 = class CreateProductHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(CreateProductHandler_1.name);
    }
    async execute(command) {
        try {
            const { data, createdById } = command;
            let code = data.code;
            if (!code) {
                const count = await this.prisma.working.product.count();
                code = `PRD-${String(count + 1).padStart(5, '0')}`;
            }
            const existing = await this.prisma.working.product.findFirst({ where: { code } });
            if (existing) {
                throw new common_1.ConflictException(`Product code "${code}" already exists`);
            }
            const slug = await this.generateUniqueSlug(data.name);
            let parentId = data.parentId;
            let isMaster = data.isMaster ?? false;
            if (parentId) {
                const parent = await this.prisma.working.product.findUnique({
                    where: { id: parentId },
                });
                if (!parent) {
                    throw new common_1.NotFoundException(`Parent product "${parentId}" not found`);
                }
                isMaster = false;
            }
            if (isMaster === true) {
                parentId = undefined;
            }
            const product = await this.prisma.working.product.create({
                data: {
                    name: data.name,
                    code,
                    slug,
                    shortDescription: data.shortDescription,
                    description: data.description,
                    parentId,
                    isMaster,
                    image: data.image,
                    brochureUrl: data.brochureUrl,
                    videoUrl: data.videoUrl,
                    mrp: data.mrp,
                    salePrice: data.salePrice,
                    purchasePrice: data.purchasePrice,
                    costPrice: data.costPrice,
                    taxType: data.taxType,
                    hsnCode: data.hsnCode,
                    gstRate: data.gstRate,
                    cessRate: data.cessRate,
                    taxInclusive: data.taxInclusive,
                    primaryUnit: data.primaryUnit,
                    secondaryUnit: data.secondaryUnit,
                    conversionFactor: data.conversionFactor,
                    minOrderQty: data.minOrderQty,
                    maxOrderQty: data.maxOrderQty,
                    weight: data.weight,
                    packingSize: data.packingSize,
                    packingUnit: data.packingUnit,
                    packingDescription: data.packingDescription,
                    barcode: data.barcode,
                    batchTracking: data.batchTracking,
                    licenseRequired: data.licenseRequired,
                    licenseType: data.licenseType,
                    licenseNumber: data.licenseNumber,
                    individualSale: data.individualSale,
                    isReturnable: data.isReturnable,
                    warrantyMonths: data.warrantyMonths,
                    shelfLifeDays: data.shelfLifeDays,
                    brandId: data.brandId,
                    manufacturerId: data.manufacturerId,
                    tags: data.tags ?? [],
                    sortOrder: data.sortOrder ?? 0,
                    createdById,
                },
            });
            if (data.gstRate != null) {
                await this.createTaxDetails(product.id, data.gstRate, data.cessRate);
            }
            this.logger.log(`Product created: ${product.id} (${product.code})`);
            return product;
        }
        catch (error) {
            this.logger.error(`CreateProductHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
    async generateUniqueSlug(name) {
        const base = name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/[\s]+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        let slug = base;
        let suffix = 1;
        while (await this.prisma.working.product.findFirst({ where: { slug } })) {
            suffix++;
            slug = `${base}-${suffix}`;
        }
        return slug;
    }
    async createTaxDetails(productId, gstRate, cessRate) {
        const halfRate = gstRate / 2;
        const entries = [
            { productId, taxName: 'CGST', taxRate: halfRate, description: 'Central GST' },
            { productId, taxName: 'SGST', taxRate: halfRate, description: 'State GST' },
        ];
        if (cessRate && cessRate > 0) {
            entries.push({
                productId,
                taxName: 'CESS',
                taxRate: cessRate,
                description: 'Compensation Cess',
            });
        }
        await this.prisma.working.productTaxDetail.createMany({ data: entries });
    }
};
exports.CreateProductHandler = CreateProductHandler;
exports.CreateProductHandler = CreateProductHandler = CreateProductHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(create_product_command_1.CreateProductCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CreateProductHandler);
//# sourceMappingURL=create-product.handler.js.map