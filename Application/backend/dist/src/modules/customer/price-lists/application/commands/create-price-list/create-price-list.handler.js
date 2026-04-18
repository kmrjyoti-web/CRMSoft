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
var CreatePriceListHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePriceListHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const create_price_list_command_1 = require("./create-price-list.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let CreatePriceListHandler = CreatePriceListHandler_1 = class CreatePriceListHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(CreatePriceListHandler_1.name);
    }
    async execute(cmd) {
        try {
            const { dto, createdById } = cmd;
            return this.prisma.working.priceList.create({
                data: {
                    name: dto.name,
                    description: dto.description,
                    currency: dto.currency ?? 'INR',
                    validFrom: dto.validFrom ? new Date(dto.validFrom) : undefined,
                    validTo: dto.validTo ? new Date(dto.validTo) : undefined,
                    isActive: dto.isActive ?? true,
                    priority: dto.priority ?? 0,
                    createdById,
                },
            });
        }
        catch (error) {
            this.logger.error(`CreatePriceListHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.CreatePriceListHandler = CreatePriceListHandler;
exports.CreatePriceListHandler = CreatePriceListHandler = CreatePriceListHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(create_price_list_command_1.CreatePriceListCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CreatePriceListHandler);
//# sourceMappingURL=create-price-list.handler.js.map