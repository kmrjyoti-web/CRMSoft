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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarVisibilityService = void 0;
const common_1 = require("@nestjs/common");
const task_assignment_service_1 = require("../../../customer/tasks/application/services/task-assignment.service");
let CalendarVisibilityService = class CalendarVisibilityService {
    constructor(taskAssignment) {
        this.taskAssignment = taskAssignment;
    }
    async buildWhereClause(ctx) {
        const { userId, roleLevel, tenantId } = ctx;
        if (roleLevel <= 1) {
            return { tenantId };
        }
        if (roleLevel <= 3) {
            const reporteeIds = await this.taskAssignment.getReporteeIds(userId);
            const visibleUserIds = [userId, ...reporteeIds];
            return { tenantId, organizerId: { in: visibleUserIds } };
        }
        return {
            tenantId,
            OR: [
                { organizerId: userId },
                { participants: { some: { userId } } },
            ],
        };
    }
    async buildCalendarEventWhere(ctx) {
        const { userId, roleLevel, tenantId } = ctx;
        if (roleLevel <= 1) {
            return { tenantId };
        }
        if (roleLevel <= 3) {
            const reporteeIds = await this.taskAssignment.getReporteeIds(userId);
            return { tenantId, userId: { in: [userId, ...reporteeIds] } };
        }
        return { tenantId, userId };
    }
};
exports.CalendarVisibilityService = CalendarVisibilityService;
exports.CalendarVisibilityService = CalendarVisibilityService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [task_assignment_service_1.TaskAssignmentService])
], CalendarVisibilityService);
//# sourceMappingURL=calendar-visibility.service.js.map