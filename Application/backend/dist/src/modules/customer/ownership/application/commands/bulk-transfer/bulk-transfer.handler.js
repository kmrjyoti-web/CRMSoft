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
exports.BulkTransferHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const bulk_transfer_command_1 = require("./bulk-transfer.command");
const ownership_core_service_1 = require("../../../services/ownership-core.service");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let BulkTransferHandler = class BulkTransferHandler {
    constructor(ownershipCore, prisma) {
        this.ownershipCore = ownershipCore;
        this.prisma = prisma;
    }
    async execute(command) {
        const where = { userId: command.fromUserId, isActive: true };
        if (command.entityType)
            where.entityType = command.entityType;
        const ownerships = await this.prisma.working.entityOwner.findMany({ where });
        let transferred = 0;
        let failed = 0;
        const byType = {};
        for (const o of ownerships) {
            try {
                await this.ownershipCore.transfer({
                    entityType: o.entityType, entityId: o.entityId,
                    fromUserId: command.fromUserId, toUserId: command.toUserId,
                    ownerType: o.ownerType, transferredById: command.transferredById,
                    reason: command.reason, reasonDetail: command.reasonDetail,
                });
                transferred++;
                byType[o.entityType] = (byType[o.entityType] || 0) + 1;
            }
            catch {
                failed++;
            }
        }
        return { transferred, byType, failed, total: ownerships.length };
    }
};
exports.BulkTransferHandler = BulkTransferHandler;
exports.BulkTransferHandler = BulkTransferHandler = __decorate([
    (0, cqrs_1.CommandHandler)(bulk_transfer_command_1.BulkTransferCommand),
    __metadata("design:paramtypes", [ownership_core_service_1.OwnershipCoreService,
        prisma_service_1.PrismaService])
], BulkTransferHandler);
//# sourceMappingURL=bulk-transfer.handler.js.map