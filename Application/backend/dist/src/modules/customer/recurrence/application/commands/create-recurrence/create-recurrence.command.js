"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateRecurrenceCommand = void 0;
class CreateRecurrenceCommand {
    constructor(entityType, pattern, startDate, createdById, templateData, entityId, interval, daysOfWeek, dayOfMonth, endDate, maxOccurrences) {
        this.entityType = entityType;
        this.pattern = pattern;
        this.startDate = startDate;
        this.createdById = createdById;
        this.templateData = templateData;
        this.entityId = entityId;
        this.interval = interval;
        this.daysOfWeek = daysOfWeek;
        this.dayOfMonth = dayOfMonth;
        this.endDate = endDate;
        this.maxOccurrences = maxOccurrences;
    }
}
exports.CreateRecurrenceCommand = CreateRecurrenceCommand;
//# sourceMappingURL=create-recurrence.command.js.map