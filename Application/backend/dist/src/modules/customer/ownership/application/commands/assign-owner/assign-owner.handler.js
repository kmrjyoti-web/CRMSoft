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
var AssignOwnerHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignOwnerHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const assign_owner_command_1 = require("./assign-owner.command");
const ownership_core_service_1 = require("../../../services/ownership-core.service");
let AssignOwnerHandler = AssignOwnerHandler_1 = class AssignOwnerHandler {
    constructor(ownershipCore) {
        this.ownershipCore = ownershipCore;
        this.logger = new common_1.Logger(AssignOwnerHandler_1.name);
    }
    async execute(command) {
        try {
            return this.ownershipCore.assign({
                entityType: command.entityType, entityId: command.entityId,
                userId: command.userId, ownerType: command.ownerType,
                assignedById: command.assignedById, reason: command.reason,
                reasonDetail: command.reasonDetail, method: command.method || 'MANUAL',
                validFrom: command.validFrom, validTo: command.validTo,
            });
        }
        catch (error) {
            this.logger.error(`AssignOwnerHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.AssignOwnerHandler = AssignOwnerHandler;
exports.AssignOwnerHandler = AssignOwnerHandler = AssignOwnerHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(assign_owner_command_1.AssignOwnerCommand),
    __metadata("design:paramtypes", [ownership_core_service_1.OwnershipCoreService])
], AssignOwnerHandler);
//# sourceMappingURL=assign-owner.handler.js.map