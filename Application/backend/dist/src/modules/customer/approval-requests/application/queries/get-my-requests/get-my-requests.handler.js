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
var GetMyRequestsHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetMyRequestsHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_my_requests_query_1 = require("./get-my-requests.query");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let GetMyRequestsHandler = GetMyRequestsHandler_1 = class GetMyRequestsHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetMyRequestsHandler_1.name);
    }
    async execute(query) {
        try {
            return this.prisma.working.approvalRequest.findMany({
                where: { makerId: query.makerId },
                include: {
                    checker: { select: { id: true, firstName: true, lastName: true } },
                },
                orderBy: { createdAt: 'desc' },
            });
        }
        catch (error) {
            this.logger.error(`GetMyRequestsHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetMyRequestsHandler = GetMyRequestsHandler;
exports.GetMyRequestsHandler = GetMyRequestsHandler = GetMyRequestsHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_my_requests_query_1.GetMyRequestsQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetMyRequestsHandler);
//# sourceMappingURL=get-my-requests.handler.js.map