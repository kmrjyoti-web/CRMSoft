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
var RevokeOwnerHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RevokeOwnerHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const revoke_owner_command_1 = require("./revoke-owner.command");
const ownership_core_service_1 = require("../../../services/ownership-core.service");
let RevokeOwnerHandler = RevokeOwnerHandler_1 = class RevokeOwnerHandler {
    constructor(ownershipCore) {
        this.ownershipCore = ownershipCore;
        this.logger = new common_1.Logger(RevokeOwnerHandler_1.name);
    }
    async execute(command) {
        try {
            await this.ownershipCore.revoke({
                entityType: command.entityType, entityId: command.entityId,
                userId: command.userId, ownerType: command.ownerType,
                revokedById: command.revokedById, reason: command.reason,
            });
            return { success: true };
        }
        catch (error) {
            this.logger.error(`RevokeOwnerHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.RevokeOwnerHandler = RevokeOwnerHandler;
exports.RevokeOwnerHandler = RevokeOwnerHandler = RevokeOwnerHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(revoke_owner_command_1.RevokeOwnerCommand),
    __metadata("design:paramtypes", [ownership_core_service_1.OwnershipCoreService])
], RevokeOwnerHandler);
//# sourceMappingURL=revoke-owner.handler.js.map