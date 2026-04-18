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
var GetProductByIdHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetProductByIdHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const get_product_by_id_query_1 = require("./get-product-by-id.query");
let GetProductByIdHandler = GetProductByIdHandler_1 = class GetProductByIdHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetProductByIdHandler_1.name);
    }
    async execute(query) {
        try {
            const product = await this.prisma.working.product.findUnique({
                where: { id: query.id },
                include: {
                    parent: { select: { id: true, name: true, code: true } },
                    brand: { select: { id: true, name: true, code: true } },
                    manufacturer: { select: { id: true, name: true, code: true } },
                    children: {
                        select: {
                            id: true, name: true, code: true,
                            salePrice: true, image: true, status: true,
                        },
                    },
                    prices: true,
                    taxDetails: true,
                    unitConversions: true,
                    filters: {
                        include: {
                            lookupValue: {
                                select: {
                                    id: true, value: true, label: true,
                                    lookup: { select: { id: true, category: true, displayName: true } },
                                },
                            },
                        },
                    },
                    relatedFrom: {
                        include: {
                            toProduct: {
                                select: {
                                    id: true, name: true, code: true,
                                    salePrice: true, image: true, status: true,
                                },
                            },
                        },
                    },
                    relatedTo: {
                        include: {
                            fromProduct: {
                                select: {
                                    id: true, name: true, code: true,
                                    salePrice: true, image: true, status: true,
                                },
                            },
                        },
                    },
                },
            });
            if (!product) {
                throw new common_1.NotFoundException(`Product "${query.id}" not found`);
            }
            return product;
        }
        catch (error) {
            this.logger.error(`GetProductByIdHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetProductByIdHandler = GetProductByIdHandler;
exports.GetProductByIdHandler = GetProductByIdHandler = GetProductByIdHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_product_by_id_query_1.GetProductByIdQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetProductByIdHandler);
//# sourceMappingURL=get-product-by-id.handler.js.map