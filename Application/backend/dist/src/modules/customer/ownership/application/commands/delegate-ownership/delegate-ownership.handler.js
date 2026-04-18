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
var DelegateOwnershipHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DelegateOwnershipHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const delegate_ownership_command_1 = require("./delegate-ownership.command");
const delegation_service_1 = require("../../../services/delegation.service");
let DelegateOwnershipHandler = DelegateOwnershipHandler_1 = class DelegateOwnershipHandler {
    constructor(delegation) {
        this.delegation = delegation;
        this.logger = new common_1.Logger(DelegateOwnershipHandler_1.name);
    }
    async execute(command) {
        try {
            return this.delegation.delegate({
                fromUserId: command.fromUserId, toUserId: command.toUserId,
                entityType: command.entityType, startDate: command.startDate,
                endDate: command.endDate, reason: command.reason,
                delegatedById: command.delegatedById,
            });
        }
        catch (error) {
            this.logger.error(`DelegateOwnershipHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.DelegateOwnershipHandler = DelegateOwnershipHandler;
exports.DelegateOwnershipHandler = DelegateOwnershipHandler = DelegateOwnershipHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(delegate_ownership_command_1.DelegateOwnershipCommand),
    __metadata("design:paramtypes", [delegation_service_1.DelegationService])
], DelegateOwnershipHandler);
//# sourceMappingURL=delegate-ownership.handler.js.map