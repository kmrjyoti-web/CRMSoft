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
var SetSlabPriceHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetSlabPriceHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const set_slab_price_command_1 = require("./set-slab-price.command");
let SetSlabPriceHandler = SetSlabPriceHandler_1 = class SetSlabPriceHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(SetSlabPriceHandler_1.name);
    }
    async execute(command) {
        try {
            const { productId, priceType, slabs } = command;
            const product = await this.prisma.working.product.findUnique({
                where: { id: productId },
                select: { id: true },
            });
            if (!product) {
                throw new common_1.NotFoundException(`Product "${productId}" not found`);
            }
            this.validateSlabsNoOverlap(slabs);
            await this.prisma.working.productPrice.deleteMany({
                where: {
                    productId,
                    priceType: priceType,
                    priceGroupId: null,
                    minQty: { not: null },
                },
            });
            const created = await this.prisma.working.productPrice.createMany({
                data: slabs.map((slab) => ({
                    productId,
                    priceType: priceType,
                    amount: slab.amount,
                    minQty: slab.minQty,
                    maxQty: slab.maxQty ?? null,
                })),
            });
            this.logger.log(`Set ${created.count} slab prices for product ` +
                `${productId}, type=${priceType}`);
            return { productId, priceType, slabCount: created.count };
        }
        catch (error) {
            this.logger.error(`SetSlabPriceHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
    validateSlabsNoOverlap(slabs) {
        if (slabs.length === 0) {
            throw new common_1.BadRequestException('At least one slab is required');
        }
        const sorted = [...slabs].sort((a, b) => a.minQty - b.minQty);
        for (let i = 0; i < sorted.length - 1; i++) {
            const current = sorted[i];
            const next = sorted[i + 1];
            if (current.maxQty == null) {
                throw new common_1.BadRequestException('Only the last slab can have an open-ended maxQty (null). ' +
                    `Slab at minQty=${current.minQty} is not the last slab.`);
            }
            if (current.maxQty >= next.minQty) {
                throw new common_1.BadRequestException(`Slab overlap: [${current.minQty}-${current.maxQty}] ` +
                    `overlaps with [${next.minQty}-${next.maxQty ?? 'inf'}]`);
            }
        }
    }
};
exports.SetSlabPriceHandler = SetSlabPriceHandler;
exports.SetSlabPriceHandler = SetSlabPriceHandler = SetSlabPriceHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(set_slab_price_command_1.SetSlabPriceCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SetSlabPriceHandler);
//# sourceMappingURL=set-slab-price.handler.js.map