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
var AddPriceListItemHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddPriceListItemHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const add_price_list_item_command_1 = require("./add-price-list-item.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let AddPriceListItemHandler = AddPriceListItemHandler_1 = class AddPriceListItemHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(AddPriceListItemHandler_1.name);
    }
    async execute(cmd) {
        try {
            const { priceListId, dto } = cmd;
            const minQty = dto.minQuantity ?? 1;
            return this.prisma.working.priceListItem.upsert({
                where: {
                    priceListId_productId_minQuantity: {
                        priceListId,
                        productId: dto.productId,
                        minQuantity: minQty,
                    },
                },
                create: {
                    priceListId,
                    productId: dto.productId,
                    sellingPrice: dto.sellingPrice,
                    minQuantity: minQty,
                    maxQuantity: dto.maxQuantity,
                    marginPercent: dto.marginPercent,
                },
                update: {
                    sellingPrice: dto.sellingPrice,
                    maxQuantity: dto.maxQuantity,
                    marginPercent: dto.marginPercent,
                },
            });
        }
        catch (error) {
            this.logger.error(`AddPriceListItemHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.AddPriceListItemHandler = AddPriceListItemHandler;
exports.AddPriceListItemHandler = AddPriceListItemHandler = AddPriceListItemHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(add_price_list_item_command_1.AddPriceListItemCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AddPriceListItemHandler);
//# sourceMappingURL=add-price-list-item.handler.js.map