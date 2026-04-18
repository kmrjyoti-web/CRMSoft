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
var GetProductTreeHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetProductTreeHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const get_product_tree_query_1 = require("./get-product-tree.query");
let GetProductTreeHandler = GetProductTreeHandler_1 = class GetProductTreeHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetProductTreeHandler_1.name);
    }
    async execute(_query) {
        try {
            return this.prisma.working.product.findMany({
                where: {
                    isMaster: true,
                    isActive: true,
                },
                orderBy: { sortOrder: 'asc' },
                include: {
                    children: {
                        where: { isActive: true },
                        orderBy: { sortOrder: 'asc' },
                        select: {
                            id: true,
                            name: true,
                            code: true,
                            slug: true,
                            salePrice: true,
                            image: true,
                            status: true,
                            sortOrder: true,
                        },
                    },
                },
            });
        }
        catch (error) {
            this.logger.error(`GetProductTreeHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetProductTreeHandler = GetProductTreeHandler;
exports.GetProductTreeHandler = GetProductTreeHandler = GetProductTreeHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_product_tree_query_1.GetProductTreeQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetProductTreeHandler);
//# sourceMappingURL=get-product-tree.handler.js.map