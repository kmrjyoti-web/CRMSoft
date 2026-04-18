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
var RecalculateUsageHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecalculateUsageHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const recalculate_usage_command_1 = require("./recalculate-usage.command");
const usage_tracker_service_1 = require("../../../services/usage-tracker.service");
let RecalculateUsageHandler = RecalculateUsageHandler_1 = class RecalculateUsageHandler {
    constructor(usageTracker) {
        this.usageTracker = usageTracker;
        this.logger = new common_1.Logger(RecalculateUsageHandler_1.name);
    }
    async execute(command) {
        try {
            await this.usageTracker.recalculate(command.tenantId);
            this.logger.log(`Usage recalculated for tenant ${command.tenantId}`);
        }
        catch (error) {
            this.logger.error(`RecalculateUsageHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.RecalculateUsageHandler = RecalculateUsageHandler;
exports.RecalculateUsageHandler = RecalculateUsageHandler = RecalculateUsageHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(recalculate_usage_command_1.RecalculateUsageCommand),
    __metadata("design:paramtypes", [usage_tracker_service_1.UsageTrackerService])
], RecalculateUsageHandler);
//# sourceMappingURL=recalculate-usage.handler.js.map