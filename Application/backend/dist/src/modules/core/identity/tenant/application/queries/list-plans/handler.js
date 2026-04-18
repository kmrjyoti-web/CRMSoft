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
var ListPlansHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListPlansHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../../core/prisma/prisma.service");
const query_1 = require("./query");
let ListPlansHandler = ListPlansHandler_1 = class ListPlansHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ListPlansHandler_1.name);
    }
    async execute(query) {
        this.logger.log('Listing plans');
        const where = {};
        if (query.isActive !== undefined) {
            where.isActive = query.isActive;
        }
        return this.prisma.identity.plan.findMany({
            where,
            orderBy: { sortOrder: 'asc' },
        });
    }
};
exports.ListPlansHandler = ListPlansHandler;
exports.ListPlansHandler = ListPlansHandler = ListPlansHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(query_1.ListPlansQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ListPlansHandler);
//# sourceMappingURL=handler.js.map