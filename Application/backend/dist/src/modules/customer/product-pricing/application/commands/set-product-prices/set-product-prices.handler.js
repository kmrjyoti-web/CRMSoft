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
var SetProductPricesHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetProductPricesHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const set_product_prices_command_1 = require("./set-product-prices.command");
let SetProductPricesHandler = SetProductPricesHandler_1 = class SetProductPricesHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(SetProductPricesHandler_1.name);
    }
    async execute(command) {
        try {
            const { productId, prices } = command;
            const product = await this.prisma.working.product.findUnique({
                where: { id: productId },
                select: { id: true },
            });
            if (!product) {
                throw new common_1.NotFoundException(`Product "${productId}" not found`);
            }
            const upserted = [];
            for (const p of prices) {
                const existing = await this.prisma.working.productPrice.findFirst({
                    where: {
                        productId,
                        priceType: p.priceType,
                        priceGroupId: p.priceGroupId ?? null,
                        minQty: p.minQty ?? null,
                    },
                });
                const record = existing
                    ? await this.prisma.working.productPrice.update({
                        where: { id: existing.id },
                        data: {
                            amount: p.amount,
                            validFrom: p.validFrom ? new Date(p.validFrom) : null,
                            validTo: p.validTo ? new Date(p.validTo) : null,
                            maxQty: p.maxQty ?? null,
                            isActive: true,
                        },
                    })
                    : await this.prisma.working.productPrice.create({
                        data: {
                            productId,
                            priceType: p.priceType,
                            amount: p.amount,
                            priceGroupId: p.priceGroupId || null,
                            minQty: p.minQty ?? null,
                            maxQty: p.maxQty ?? null,
                            validFrom: p.validFrom ? new Date(p.validFrom) : null,
                            validTo: p.validTo ? new Date(p.validTo) : null,
                        },
                    });
                upserted.push(record);
            }
            this.logger.log(`Set ${upserted.length} price(s) for product ${productId}`);
            return { productId, pricesSet: upserted.length };
        }
        catch (error) {
            this.logger.error(`SetProductPricesHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.SetProductPricesHandler = SetProductPricesHandler;
exports.SetProductPricesHandler = SetProductPricesHandler = SetProductPricesHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(set_product_prices_command_1.SetProductPricesCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SetProductPricesHandler);
//# sourceMappingURL=set-product-prices.handler.js.map