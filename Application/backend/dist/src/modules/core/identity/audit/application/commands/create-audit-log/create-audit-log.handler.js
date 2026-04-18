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
var CreateAuditLogHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAuditLogHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const create_audit_log_command_1 = require("./create-audit-log.command");
const audit_core_service_1 = require("../../../services/audit-core.service");
let CreateAuditLogHandler = CreateAuditLogHandler_1 = class CreateAuditLogHandler {
    constructor(auditService) {
        this.auditService = auditService;
        this.logger = new common_1.Logger(CreateAuditLogHandler_1.name);
    }
    async execute(command) {
        try {
            return this.auditService.logAction({
                entityType: command.entityType,
                entityId: command.entityId,
                action: command.action,
                summary: command.summary,
                source: command.source,
                module: command.module,
                performedById: command.performedById,
                performedByName: command.performedByName,
                changes: command.changes,
                correlationId: command.correlationId,
                tags: command.tags,
            });
        }
        catch (error) {
            this.logger.error(`CreateAuditLogHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.CreateAuditLogHandler = CreateAuditLogHandler;
exports.CreateAuditLogHandler = CreateAuditLogHandler = CreateAuditLogHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(create_audit_log_command_1.CreateAuditLogCommand),
    __metadata("design:paramtypes", [audit_core_service_1.AuditCoreService])
], CreateAuditLogHandler);
//# sourceMappingURL=create-audit-log.handler.js.map