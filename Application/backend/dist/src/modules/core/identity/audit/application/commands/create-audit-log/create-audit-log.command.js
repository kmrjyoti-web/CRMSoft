"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAuditLogCommand = void 0;
class CreateAuditLogCommand {
    constructor(entityType, entityId, action, summary, source, performedById, performedByName, module, changes, correlationId, tags) {
        this.entityType = entityType;
        this.entityId = entityId;
        this.action = action;
        this.summary = summary;
        this.source = source;
        this.performedById = performedById;
        this.performedByName = performedByName;
        this.module = module;
        this.changes = changes;
        this.correlationId = correlationId;
        this.tags = tags;
    }
}
exports.CreateAuditLogCommand = CreateAuditLogCommand;
//# sourceMappingURL=create-audit-log.command.js.map