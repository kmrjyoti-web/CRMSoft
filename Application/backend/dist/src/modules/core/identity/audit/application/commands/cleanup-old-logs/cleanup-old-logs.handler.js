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
var CleanupOldLogsHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CleanupOldLogsHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const cleanup_old_logs_command_1 = require("./cleanup-old-logs.command");
const audit_cleanup_service_1 = require("../../../services/audit-cleanup.service");
let CleanupOldLogsHandler = CleanupOldLogsHandler_1 = class CleanupOldLogsHandler {
    constructor(cleanupService) {
        this.cleanupService = cleanupService;
        this.logger = new common_1.Logger(CleanupOldLogsHandler_1.name);
    }
    async execute(_command) {
        try {
            return this.cleanupService.cleanupOldLogs();
        }
        catch (error) {
            this.logger.error(`CleanupOldLogsHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.CleanupOldLogsHandler = CleanupOldLogsHandler;
exports.CleanupOldLogsHandler = CleanupOldLogsHandler = CleanupOldLogsHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(cleanup_old_logs_command_1.CleanupOldLogsCommand),
    __metadata("design:paramtypes", [audit_cleanup_service_1.AuditCleanupService])
], CleanupOldLogsHandler);
//# sourceMappingURL=cleanup-old-logs.handler.js.map