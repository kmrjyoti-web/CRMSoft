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
var MarkAllReadHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkAllReadHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const mark_all_read_command_1 = require("./mark-all-read.command");
const notification_core_service_1 = require("../../../services/notification-core.service");
let MarkAllReadHandler = MarkAllReadHandler_1 = class MarkAllReadHandler {
    constructor(notificationCore) {
        this.notificationCore = notificationCore;
        this.logger = new common_1.Logger(MarkAllReadHandler_1.name);
    }
    async execute(command) {
        try {
            return this.notificationCore.markAllRead(command.userId, command.category);
        }
        catch (error) {
            this.logger.error(`MarkAllReadHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.MarkAllReadHandler = MarkAllReadHandler;
exports.MarkAllReadHandler = MarkAllReadHandler = MarkAllReadHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(mark_all_read_command_1.MarkAllReadCommand),
    __metadata("design:paramtypes", [notification_core_service_1.NotificationCoreService])
], MarkAllReadHandler);
//# sourceMappingURL=mark-all-read.handler.js.map