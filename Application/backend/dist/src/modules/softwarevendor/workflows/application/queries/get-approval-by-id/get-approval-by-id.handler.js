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
var GetApprovalByIdHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetApprovalByIdHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const get_approval_by_id_query_1 = require("./get-approval-by-id.query");
let GetApprovalByIdHandler = GetApprovalByIdHandler_1 = class GetApprovalByIdHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetApprovalByIdHandler_1.name);
    }
    async execute(query) {
        try {
            const approval = await this.prisma.workflowApproval.findUnique({
                where: { id: query.approvalId },
                include: {
                    instance: {
                        include: {
                            workflow: { select: { id: true, name: true, code: true } },
                            currentState: { select: { id: true, name: true, code: true } },
                        },
                    },
                    transition: {
                        include: {
                            fromState: { select: { id: true, name: true, code: true } },
                            toState: { select: { id: true, name: true, code: true } },
                        },
                    },
                },
            });
            if (!approval)
                throw new common_1.NotFoundException(`Approval "${query.approvalId}" not found`);
            return approval;
        }
        catch (error) {
            this.logger.error(`GetApprovalByIdHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetApprovalByIdHandler = GetApprovalByIdHandler;
exports.GetApprovalByIdHandler = GetApprovalByIdHandler = GetApprovalByIdHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_approval_by_id_query_1.GetApprovalByIdQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetApprovalByIdHandler);
//# sourceMappingURL=get-approval-by-id.handler.js.map