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
var SetGroupPriceHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetGroupPriceHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const set_group_price_command_1 = require("./set-group-price.command");
let SetGroupPriceHandler = SetGroupPriceHandler_1 = class SetGroupPriceHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(SetGroupPriceHandler_1.name);
    }
    async execute(command) {
        try {
            const { productId, priceGroupId, priceType, amount } = command;
            const product = await this.prisma.working.product.findUnique({
                where: { id: productId },
                select: { id: true },
            });
            if (!product) {
                throw new common_1.NotFoundException(`Product "${productId}" not found`);
            }
            const group = await this.prisma.working.customerPriceGroup.findUnique({
                where: { id: priceGroupId },
                select: { id: true, name: true },
            });
            if (!group) {
                throw new common_1.NotFoundException(`Price group "${priceGroupId}" not found`);
            }
            const existing = await this.prisma.working.productPrice.findFirst({
                where: {
                    productId,
                    priceType: priceType,
                    priceGroupId,
                    OR: [{ minQty: null }, { minQty: 0 }],
                },
            });
            let price;
            if (existing) {
                price = await this.prisma.working.productPrice.update({
                    where: { id: existing.id },
                    data: { amount, isActive: true },
                });
            }
            else {
                price = await this.prisma.working.productPrice.create({
                    data: {
                        productId,
                        priceType: priceType,
                        priceGroupId,
                        amount,
                    },
                });
            }
            this.logger.log(`Set group price: product=${productId}, ` +
                `group=${group.name}, type=${priceType}, amount=${amount}`);
            return price;
        }
        catch (error) {
            this.logger.error(`SetGroupPriceHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.SetGroupPriceHandler = SetGroupPriceHandler;
exports.SetGroupPriceHandler = SetGroupPriceHandler = SetGroupPriceHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(set_group_price_command_1.SetGroupPriceCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SetGroupPriceHandler);
//# sourceMappingURL=set-group-price.handler.js.map