"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateBulkAuditLogCommand = void 0;
class CreateBulkAuditLogCommand {
    constructor(entityType, entityIds, action, summary, source, performedById, performedByName, module, correlationId) {
        this.entityType = entityType;
        this.entityIds = entityIds;
        this.action = action;
        this.summary = summary;
        this.source = source;
        this.performedById = performedById;
        this.performedByName = performedByName;
        this.module = module;
        this.correlationId = correlationId;
    }
}
exports.CreateBulkAuditLogCommand = CreateBulkAuditLogCommand;
//# sourceMappingURL=create-bulk-audit-log.command.js.map