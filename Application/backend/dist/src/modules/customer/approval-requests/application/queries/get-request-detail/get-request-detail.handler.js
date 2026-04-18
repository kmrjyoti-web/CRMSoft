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
var GetRequestDetailHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetRequestDetailHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_request_detail_query_1 = require("./get-request-detail.query");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let GetRequestDetailHandler = GetRequestDetailHandler_1 = class GetRequestDetailHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetRequestDetailHandler_1.name);
    }
    async execute(query) {
        try {
            const request = await this.prisma.working.approvalRequest.findUnique({
                where: { id: query.requestId },
                include: {
                    maker: { select: { id: true, firstName: true, lastName: true, email: true } },
                    checker: { select: { id: true, firstName: true, lastName: true, email: true } },
                },
            });
            if (!request)
                throw new common_1.NotFoundException('Approval request not found');
            return request;
        }
        catch (error) {
            this.logger.error(`GetRequestDetailHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetRequestDetailHandler = GetRequestDetailHandler;
exports.GetRequestDetailHandler = GetRequestDetailHandler = GetRequestDetailHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_request_detail_query_1.GetRequestDetailQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetRequestDetailHandler);
//# sourceMappingURL=get-request-detail.handler.js.map