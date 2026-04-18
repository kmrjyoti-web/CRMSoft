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
var RevertDelegationHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RevertDelegationHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const revert_delegation_command_1 = require("./revert-delegation.command");
const delegation_service_1 = require("../../../services/delegation.service");
let RevertDelegationHandler = RevertDelegationHandler_1 = class RevertDelegationHandler {
    constructor(delegation) {
        this.delegation = delegation;
        this.logger = new common_1.Logger(RevertDelegationHandler_1.name);
    }
    async execute(command) {
        try {
            return this.delegation.revertDelegation(command.delegationId, command.revertedById);
        }
        catch (error) {
            this.logger.error(`RevertDelegationHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.RevertDelegationHandler = RevertDelegationHandler;
exports.RevertDelegationHandler = RevertDelegationHandler = RevertDelegationHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(revert_delegation_command_1.RevertDelegationCommand),
    __metadata("design:paramtypes", [delegation_service_1.DelegationService])
], RevertDelegationHandler);
//# sourceMappingURL=revert-delegation.handler.js.map