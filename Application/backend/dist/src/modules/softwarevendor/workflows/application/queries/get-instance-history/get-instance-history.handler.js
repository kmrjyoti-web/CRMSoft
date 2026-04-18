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
var GetInstanceHistoryHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetInstanceHistoryHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const get_instance_history_query_1 = require("./get-instance-history.query");
let GetInstanceHistoryHandler = GetInstanceHistoryHandler_1 = class GetInstanceHistoryHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetInstanceHistoryHandler_1.name);
    }
    async execute(query) {
        try {
            return this.prisma.workflowHistory.findMany({
                where: { instanceId: query.instanceId },
                include: {
                    fromState: { select: { id: true, name: true, code: true, color: true } },
                    toState: { select: { id: true, name: true, code: true, color: true } },
                    transition: { select: { id: true, name: true, code: true } },
                },
                orderBy: { createdAt: 'desc' },
            });
        }
        catch (error) {
            this.logger.error(`GetInstanceHistoryHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetInstanceHistoryHandler = GetInstanceHistoryHandler;
exports.GetInstanceHistoryHandler = GetInstanceHistoryHandler = GetInstanceHistoryHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_instance_history_query_1.GetInstanceHistoryQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetInstanceHistoryHandler);
//# sourceMappingURL=get-instance-history.handler.js.map