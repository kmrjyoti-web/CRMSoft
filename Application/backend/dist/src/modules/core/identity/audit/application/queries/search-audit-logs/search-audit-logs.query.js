"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchAuditLogsQuery = void 0;
class SearchAuditLogsQuery {
    constructor(q, entityType, action, userId, dateFrom, dateTo, field, module, sensitive, page, limit) {
        this.q = q;
        this.entityType = entityType;
        this.action = action;
        this.userId = userId;
        this.dateFrom = dateFrom;
        this.dateTo = dateTo;
        this.field = field;
        this.module = module;
        this.sensitive = sensitive;
        this.page = page;
        this.limit = limit;
    }
}
exports.SearchAuditLogsQuery = SearchAuditLogsQuery;
//# sourceMappingURL=search-audit-logs.query.js.map