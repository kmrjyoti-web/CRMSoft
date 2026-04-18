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
var TransferOwnerHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransferOwnerHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const transfer_owner_command_1 = require("./transfer-owner.command");
const ownership_core_service_1 = require("../../../services/ownership-core.service");
let TransferOwnerHandler = TransferOwnerHandler_1 = class TransferOwnerHandler {
    constructor(ownershipCore) {
        this.ownershipCore = ownershipCore;
        this.logger = new common_1.Logger(TransferOwnerHandler_1.name);
    }
    async execute(command) {
        try {
            return this.ownershipCore.transfer({
                entityType: command.entityType, entityId: command.entityId,
                fromUserId: command.fromUserId, toUserId: command.toUserId,
                ownerType: command.ownerType, transferredById: command.transferredById,
                reason: command.reason, reasonDetail: command.reasonDetail,
            });
        }
        catch (error) {
            this.logger.error(`TransferOwnerHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.TransferOwnerHandler = TransferOwnerHandler;
exports.TransferOwnerHandler = TransferOwnerHandler = TransferOwnerHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(transfer_owner_command_1.TransferOwnerCommand),
    __metadata("design:paramtypes", [ownership_core_service_1.OwnershipCoreService])
], TransferOwnerHandler);
//# sourceMappingURL=transfer-owner.handler.js.map