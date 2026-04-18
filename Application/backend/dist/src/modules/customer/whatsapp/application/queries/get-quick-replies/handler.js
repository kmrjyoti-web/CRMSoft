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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetQuickRepliesHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const query_1 = require("./query");
let GetQuickRepliesHandler = class GetQuickRepliesHandler {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async execute(query) {
        const where = { wabaId: query.wabaId };
        if (query.category)
            where.category = query.category;
        return this.prisma.working.waQuickReply.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.GetQuickRepliesHandler = GetQuickRepliesHandler;
exports.GetQuickRepliesHandler = GetQuickRepliesHandler = __decorate([
    (0, cqrs_1.QueryHandler)(query_1.GetQuickRepliesQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetQuickRepliesHandler);
//# sourceMappingURL=handler.js.map