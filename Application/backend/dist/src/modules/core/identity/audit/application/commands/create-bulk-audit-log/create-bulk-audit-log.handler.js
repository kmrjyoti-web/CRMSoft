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
var CreateBulkAuditLogHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateBulkAuditLogHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const create_bulk_audit_log_command_1 = require("./create-bulk-audit-log.command");
const audit_core_service_1 = require("../../../services/audit-core.service");
let CreateBulkAuditLogHandler = CreateBulkAuditLogHandler_1 = class CreateBulkAuditLogHandler {
    constructor(auditService) {
        this.auditService = auditService;
        this.logger = new common_1.Logger(CreateBulkAuditLogHandler_1.name);
    }
    async execute(command) {
        try {
            const correlationId = command.correlationId || `bulk-${Date.now()}`;
            const results = await Promise.all(command.entityIds.map(entityId => this.auditService.logAction({
                entityType: command.entityType,
                entityId,
                action: command.action,
                summary: command.summary,
                source: command.source,
                module: command.module,
                performedById: command.performedById,
                performedByName: command.performedByName,
                correlationId,
            })));
            return { logged: results.filter(Boolean).length, correlationId };
        }
        catch (error) {
            this.logger.error(`CreateBulkAuditLogHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.CreateBulkAuditLogHandler = CreateBulkAuditLogHandler;
exports.CreateBulkAuditLogHandler = CreateBulkAuditLogHandler = CreateBulkAuditLogHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(create_bulk_audit_log_command_1.CreateBulkAuditLogCommand),
    __metadata("design:paramtypes", [audit_core_service_1.AuditCoreService])
], CreateBulkAuditLogHandler);
//# sourceMappingURL=create-bulk-audit-log.handler.js.map