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
var AssignProductFiltersHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignProductFiltersHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const assign_product_filters_command_1 = require("./assign-product-filters.command");
let AssignProductFiltersHandler = AssignProductFiltersHandler_1 = class AssignProductFiltersHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(AssignProductFiltersHandler_1.name);
    }
    async execute(command) {
        try {
            const { productId, lookupValueIds } = command;
            const product = await this.prisma.working.product.findUnique({
                where: { id: productId },
            });
            if (!product) {
                throw new common_1.NotFoundException(`Product "${productId}" not found`);
            }
            await this.prisma.working.productFilter.deleteMany({
                where: { productId },
            });
            if (lookupValueIds.length > 0) {
                await this.prisma.working.productFilter.createMany({
                    data: lookupValueIds.map((lookupValueId) => ({
                        productId,
                        lookupValueId,
                    })),
                    skipDuplicates: true,
                });
            }
            this.logger.log(`Product filters assigned: ${productId} (${lookupValueIds.length} filters)`);
            return this.prisma.working.productFilter.findMany({
                where: { productId },
                include: {
                    lookupValue: { select: { id: true, value: true, label: true } },
                },
            });
        }
        catch (error) {
            this.logger.error(`AssignProductFiltersHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.AssignProductFiltersHandler = AssignProductFiltersHandler;
exports.AssignProductFiltersHandler = AssignProductFiltersHandler = AssignProductFiltersHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(assign_product_filters_command_1.AssignProductFiltersCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AssignProductFiltersHandler);
//# sourceMappingURL=assign-product-filters.handler.js.map