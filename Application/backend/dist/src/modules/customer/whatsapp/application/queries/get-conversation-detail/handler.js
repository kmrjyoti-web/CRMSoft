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
exports.GetConversationDetailHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const query_1 = require("./query");
let GetConversationDetailHandler = class GetConversationDetailHandler {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async execute(query) {
        return this.prisma.working.waConversation.findUniqueOrThrow({
            where: { id: query.conversationId },
            include: {
                assignedTo: {
                    select: { id: true, firstName: true, lastName: true },
                },
                messages: {
                    take: 50,
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
    }
};
exports.GetConversationDetailHandler = GetConversationDetailHandler;
exports.GetConversationDetailHandler = GetConversationDetailHandler = __decorate([
    (0, cqrs_1.QueryHandler)(query_1.GetConversationDetailQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetConversationDetailHandler);
//# sourceMappingURL=handler.js.map