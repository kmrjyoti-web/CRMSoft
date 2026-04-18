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
exports.GetConversationsHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const query_1 = require("./query");
let GetConversationsHandler = class GetConversationsHandler {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async execute(query) {
        const where = { wabaId: query.wabaId };
        if (query.status)
            where.status = query.status;
        if (query.assignedToId)
            where.assignedToId = query.assignedToId;
        if (query.search) {
            where.OR = [
                { contactPhone: { contains: query.search, mode: 'insensitive' } },
                { contactName: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        const [data, total] = await Promise.all([
            this.prisma.working.waConversation.findMany({
                where,
                skip: (query.page - 1) * query.limit,
                take: query.limit,
                orderBy: { lastMessageAt: 'desc' },
            }),
            this.prisma.working.waConversation.count({ where }),
        ]);
        return {
            data,
            total,
            page: query.page,
            limit: query.limit,
            totalPages: Math.ceil(total / query.limit),
        };
    }
};
exports.GetConversationsHandler = GetConversationsHandler;
exports.GetConversationsHandler = GetConversationsHandler = __decorate([
    (0, cqrs_1.QueryHandler)(query_1.GetConversationsQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetConversationsHandler);
//# sourceMappingURL=handler.js.map