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
var UpdatePriceListHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePriceListHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const update_price_list_command_1 = require("./update-price-list.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let UpdatePriceListHandler = UpdatePriceListHandler_1 = class UpdatePriceListHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(UpdatePriceListHandler_1.name);
    }
    async execute(cmd) {
        try {
            const existing = await this.prisma.working.priceList.findFirst({
                where: { id: cmd.id, isDeleted: false },
            });
            if (!existing)
                throw new common_1.NotFoundException('PriceList not found');
            const { dto } = cmd;
            return this.prisma.working.priceList.update({
                where: { id: cmd.id },
                data: {
                    ...(dto.name !== undefined && { name: dto.name }),
                    ...(dto.description !== undefined && { description: dto.description }),
                    ...(dto.currency !== undefined && { currency: dto.currency }),
                    ...(dto.validFrom !== undefined && { validFrom: dto.validFrom ? new Date(dto.validFrom) : null }),
                    ...(dto.validTo !== undefined && { validTo: dto.validTo ? new Date(dto.validTo) : null }),
                    ...(dto.isActive !== undefined && { isActive: dto.isActive }),
                    ...(dto.priority !== undefined && { priority: dto.priority }),
                },
            });
        }
        catch (error) {
            this.logger.error(`UpdatePriceListHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.UpdatePriceListHandler = UpdatePriceListHandler;
exports.UpdatePriceListHandler = UpdatePriceListHandler = UpdatePriceListHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(update_price_list_command_1.UpdatePriceListCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UpdatePriceListHandler);
//# sourceMappingURL=update-price-list.handler.js.map