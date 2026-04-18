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
var SetUserAvailabilityHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetUserAvailabilityHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const set_user_availability_command_1 = require("./set-user-availability.command");
const workload_service_1 = require("../../../services/workload.service");
const delegation_service_1 = require("../../../services/delegation.service");
let SetUserAvailabilityHandler = SetUserAvailabilityHandler_1 = class SetUserAvailabilityHandler {
    constructor(workload, delegation) {
        this.workload = workload;
        this.delegation = delegation;
        this.logger = new common_1.Logger(SetUserAvailabilityHandler_1.name);
    }
    async execute(command) {
        try {
            const result = await this.workload.setAvailability({
                userId: command.userId, isAvailable: command.isAvailable,
                unavailableFrom: command.unavailableFrom, unavailableTo: command.unavailableTo,
                delegateToId: command.delegateToId,
            });
            if (!command.isAvailable && command.delegateToId && command.unavailableFrom && command.unavailableTo) {
                await this.delegation.delegate({
                    fromUserId: command.userId, toUserId: command.delegateToId,
                    startDate: command.unavailableFrom, endDate: command.unavailableTo,
                    reason: command.reason || 'On leave', delegatedById: command.performedById || command.userId,
                });
            }
            return result;
        }
        catch (error) {
            this.logger.error(`SetUserAvailabilityHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.SetUserAvailabilityHandler = SetUserAvailabilityHandler;
exports.SetUserAvailabilityHandler = SetUserAvailabilityHandler = SetUserAvailabilityHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(set_user_availability_command_1.SetUserAvailabilityCommand),
    __metadata("design:paramtypes", [workload_service_1.WorkloadService,
        delegation_service_1.DelegationService])
], SetUserAvailabilityHandler);
//# sourceMappingURL=set-user-availability.handler.js.map