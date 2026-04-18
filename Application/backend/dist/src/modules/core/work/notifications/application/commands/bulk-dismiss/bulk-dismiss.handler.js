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
var BulkDismissHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BulkDismissHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const bulk_dismiss_command_1 = require("./bulk-dismiss.command");
const notification_core_service_1 = require("../../../services/notification-core.service");
let BulkDismissHandler = BulkDismissHandler_1 = class BulkDismissHandler {
    constructor(notificationCore) {
        this.notificationCore = notificationCore;
        this.logger = new common_1.Logger(BulkDismissHandler_1.name);
    }
    async execute(command) {
        try {
            return this.notificationCore.bulkDismiss(command.notificationIds, command.userId);
        }
        catch (error) {
            this.logger.error(`BulkDismissHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.BulkDismissHandler = BulkDismissHandler;
exports.BulkDismissHandler = BulkDismissHandler = BulkDismissHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(bulk_dismiss_command_1.BulkDismissCommand),
    __metadata("design:paramtypes", [notification_core_service_1.NotificationCoreService])
], BulkDismissHandler);
//# sourceMappingURL=bulk-dismiss.handler.js.map