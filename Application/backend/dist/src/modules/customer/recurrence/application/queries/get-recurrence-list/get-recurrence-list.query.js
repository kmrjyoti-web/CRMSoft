"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetRecurrenceListQuery = void 0;
class GetRecurrenceListQuery {
    constructor(page = 1, limit = 20, createdById, pattern, isActive) {
        this.page = page;
        this.limit = limit;
        this.createdById = createdById;
        this.pattern = pattern;
        this.isActive = isActive;
    }
}
exports.GetRecurrenceListQuery = GetRecurrenceListQuery;
//# sourceMappingURL=get-recurrence-list.query.js.map