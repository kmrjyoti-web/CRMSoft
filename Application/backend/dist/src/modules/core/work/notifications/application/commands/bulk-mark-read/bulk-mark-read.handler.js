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
var BulkMarkReadHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BulkMarkReadHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const bulk_mark_read_command_1 = require("./bulk-mark-read.command");
const notification_core_service_1 = require("../../../services/notification-core.service");
let BulkMarkReadHandler = BulkMarkReadHandler_1 = class BulkMarkReadHandler {
    constructor(notificationCore) {
        this.notificationCore = notificationCore;
        this.logger = new common_1.Logger(BulkMarkReadHandler_1.name);
    }
    async execute(command) {
        try {
            return this.notificationCore.bulkMarkRead(command.notificationIds, command.userId);
        }
        catch (error) {
            this.logger.error(`BulkMarkReadHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.BulkMarkReadHandler = BulkMarkReadHandler;
exports.BulkMarkReadHandler = BulkMarkReadHandler = BulkMarkReadHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(bulk_mark_read_command_1.BulkMarkReadCommand),
    __metadata("design:paramtypes", [notification_core_service_1.NotificationCoreService])
], BulkMarkReadHandler);
//# sourceMappingURL=bulk-mark-read.handler.js.map