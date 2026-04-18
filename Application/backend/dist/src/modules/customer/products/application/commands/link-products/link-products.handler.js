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
var LinkProductsHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkProductsHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const link_products_command_1 = require("./link-products.command");
const BIDIRECTIONAL_TYPES = ['VARIANT', 'SUBSTITUTE'];
let LinkProductsHandler = LinkProductsHandler_1 = class LinkProductsHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(LinkProductsHandler_1.name);
    }
    async execute(command) {
        try {
            const { fromProductId, toProductId, relationType } = command;
            if (fromProductId === toProductId) {
                throw new common_1.BadRequestException('Cannot link a product to itself');
            }
            const existingForward = await this.prisma.working.productRelation.findFirst({
                where: { fromProductId, toProductId, relationType },
            });
            let relation;
            if (existingForward) {
                relation = await this.prisma.working.productRelation.update({
                    where: { id: existingForward.id },
                    data: { isActive: true },
                });
            }
            else {
                relation = await this.prisma.working.productRelation.create({
                    data: { fromProductId, toProductId, relationType },
                });
            }
            if (BIDIRECTIONAL_TYPES.includes(relationType)) {
                const existingReverse = await this.prisma.working.productRelation.findFirst({
                    where: {
                        fromProductId: toProductId,
                        toProductId: fromProductId,
                        relationType,
                    },
                });
                if (existingReverse) {
                    await this.prisma.working.productRelation.update({
                        where: { id: existingReverse.id },
                        data: { isActive: true },
                    });
                }
                else {
                    await this.prisma.working.productRelation.create({
                        data: {
                            fromProductId: toProductId,
                            toProductId: fromProductId,
                            relationType,
                        },
                    });
                }
            }
            this.logger.log(`Product relation created: ${fromProductId} -> ${toProductId} (${relationType})`);
            return relation;
        }
        catch (error) {
            this.logger.error(`LinkProductsHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.LinkProductsHandler = LinkProductsHandler;
exports.LinkProductsHandler = LinkProductsHandler = LinkProductsHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(link_products_command_1.LinkProductsCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LinkProductsHandler);
//# sourceMappingURL=link-products.handler.js.map