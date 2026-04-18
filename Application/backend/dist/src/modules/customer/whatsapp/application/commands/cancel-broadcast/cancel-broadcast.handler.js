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
var CancelBroadcastHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CancelBroadcastHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const cancel_broadcast_command_1 = require("./cancel-broadcast.command");
const wa_broadcast_executor_service_1 = require("../../../services/wa-broadcast-executor.service");
let CancelBroadcastHandler = CancelBroadcastHandler_1 = class CancelBroadcastHandler {
    constructor(broadcastExecutor) {
        this.broadcastExecutor = broadcastExecutor;
        this.logger = new common_1.Logger(CancelBroadcastHandler_1.name);
    }
    async execute(cmd) {
        try {
            await this.broadcastExecutor.cancelBroadcast(cmd.broadcastId);
            this.logger.log(`Broadcast ${cmd.broadcastId} cancelled`);
        }
        catch (error) {
            this.logger.error(`CancelBroadcastHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.CancelBroadcastHandler = CancelBroadcastHandler;
exports.CancelBroadcastHandler = CancelBroadcastHandler = CancelBroadcastHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(cancel_broadcast_command_1.CancelBroadcastCommand),
    __metadata("design:paramtypes", [wa_broadcast_executor_service_1.WaBroadcastExecutorService])
], CancelBroadcastHandler);
//# sourceMappingURL=cancel-broadcast.handler.js.map