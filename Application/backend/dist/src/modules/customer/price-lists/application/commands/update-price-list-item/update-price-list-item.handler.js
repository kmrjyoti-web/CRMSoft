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
var UpdatePriceListItemHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePriceListItemHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const update_price_list_item_command_1 = require("./update-price-list-item.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let UpdatePriceListItemHandler = UpdatePriceListItemHandler_1 = class UpdatePriceListItemHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(UpdatePriceListItemHandler_1.name);
    }
    async execute(cmd) {
        try {
            const existing = await this.prisma.working.priceListItem.findUnique({
                where: { id: cmd.itemId },
            });
            if (!existing)
                throw new common_1.NotFoundException('PriceListItem not found');
            const { dto } = cmd;
            return this.prisma.working.priceListItem.update({
                where: { id: cmd.itemId },
                data: {
                    ...(dto.sellingPrice !== undefined && { sellingPrice: dto.sellingPrice }),
                    ...(dto.minQuantity !== undefined && { minQuantity: dto.minQuantity }),
                    ...(dto.maxQuantity !== undefined && { maxQuantity: dto.maxQuantity }),
                    ...(dto.marginPercent !== undefined && { marginPercent: dto.marginPercent }),
                },
            });
        }
        catch (error) {
            this.logger.error(`UpdatePriceListItemHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.UpdatePriceListItemHandler = UpdatePriceListItemHandler;
exports.UpdatePriceListItemHandler = UpdatePriceListItemHandler = UpdatePriceListItemHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(update_price_list_item_command_1.UpdatePriceListItemCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UpdatePriceListItemHandler);
//# sourceMappingURL=update-price-list-item.handler.js.map