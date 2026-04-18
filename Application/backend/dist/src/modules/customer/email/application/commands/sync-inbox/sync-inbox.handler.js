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
var SyncInboxHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncInboxHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const sync_inbox_command_1 = require("./sync-inbox.command");
const email_sync_service_1 = require("../../../services/email-sync.service");
let SyncInboxHandler = SyncInboxHandler_1 = class SyncInboxHandler {
    constructor(emailSyncService) {
        this.emailSyncService = emailSyncService;
        this.logger = new common_1.Logger(SyncInboxHandler_1.name);
    }
    async execute(cmd) {
        try {
            const result = await this.emailSyncService.syncAccount(cmd.accountId);
            this.logger.log(`Inbox sync completed for account ${cmd.accountId}: ${result.newEmails} new, ${result.errors} errors`);
            return result;
        }
        catch (error) {
            this.logger.error(`SyncInboxHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.SyncInboxHandler = SyncInboxHandler;
exports.SyncInboxHandler = SyncInboxHandler = SyncInboxHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(sync_inbox_command_1.SyncInboxCommand),
    __metadata("design:paramtypes", [email_sync_service_1.EmailSyncService])
], SyncInboxHandler);
//# sourceMappingURL=sync-inbox.handler.js.map