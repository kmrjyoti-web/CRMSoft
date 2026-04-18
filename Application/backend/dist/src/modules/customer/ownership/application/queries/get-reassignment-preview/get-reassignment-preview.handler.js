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
var GetReassignmentPreviewHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetReassignmentPreviewHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_reassignment_preview_query_1 = require("./get-reassignment-preview.query");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const workload_service_1 = require("../../../services/workload.service");
let GetReassignmentPreviewHandler = GetReassignmentPreviewHandler_1 = class GetReassignmentPreviewHandler {
    constructor(prisma, workload) {
        this.prisma = prisma;
        this.workload = workload;
        this.logger = new common_1.Logger(GetReassignmentPreviewHandler_1.name);
    }
    async execute(query) {
        try {
            const where = { userId: query.fromUserId, isActive: true };
            if (query.entityType)
                where.entityType = query.entityType;
            const ownerships = await this.prisma.working.entityOwner.findMany({ where });
            const byType = {};
            for (const o of ownerships)
                byType[o.entityType] = (byType[o.entityType] || 0) + 1;
            const fromUser = await this.prisma.user.findUnique({
                where: { id: query.fromUserId }, select: { firstName: true, lastName: true },
            });
            const fromCapacity = await this.workload.getOrCreateCapacity(query.fromUserId);
            let toUserInfo = null;
            if (query.toUserId) {
                const toUser = await this.prisma.user.findUnique({
                    where: { id: query.toUserId }, select: { firstName: true, lastName: true },
                });
                const toCapacity = await this.workload.getOrCreateCapacity(query.toUserId);
                const remaining = toCapacity.maxTotal - toCapacity.activeTotal;
                toUserInfo = {
                    name: toUser ? `${toUser.firstName} ${toUser.lastName}` : '',
                    currentLoad: toCapacity.activeTotal,
                    capacityRemaining: remaining,
                    wouldExceedCapacity: ownerships.length > remaining,
                };
            }
            const warnings = [];
            if (toUserInfo?.wouldExceedCapacity) {
                warnings.push(`Transferring ${ownerships.length} entities would exceed target user capacity (${toUserInfo.capacityRemaining} remaining)`);
            }
            return {
                fromUser: { name: fromUser ? `${fromUser.firstName} ${fromUser.lastName}` : '', currentLoad: fromCapacity.activeTotal },
                toUser: toUserInfo,
                entitiesToTransfer: ownerships.length, byType, warnings,
            };
        }
        catch (error) {
            this.logger.error(`GetReassignmentPreviewHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetReassignmentPreviewHandler = GetReassignmentPreviewHandler;
exports.GetReassignmentPreviewHandler = GetReassignmentPreviewHandler = GetReassignmentPreviewHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_reassignment_preview_query_1.GetReassignmentPreviewQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        workload_service_1.WorkloadService])
], GetReassignmentPreviewHandler);
//# sourceMappingURL=get-reassignment-preview.handler.js.map