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
exports.TaskVisibilityService = void 0;
const common_1 = require("@nestjs/common");
const task_assignment_service_1 = require("./task-assignment.service");
let TaskVisibilityService = class TaskVisibilityService {
    constructor(assignmentService) {
        this.assignmentService = assignmentService;
    }
    async buildWhereClause(ctx) {
        const base = { tenantId: ctx.tenantId, isActive: true };
        if (ctx.roleLevel <= 1) {
            return base;
        }
        const orConditions = [
            { assignedToId: ctx.userId },
            { createdById: ctx.userId },
            { watchers: { some: { userId: ctx.userId } } },
        ];
        if (ctx.roleLevel <= 3) {
            const reporteeIds = await this.assignmentService.getReporteeIds(ctx.userId);
            if (reporteeIds.length > 0) {
                orConditions.push({ assignedToId: { in: reporteeIds } });
            }
            if (ctx.departmentId) {
                orConditions.push({ assignedDepartmentId: ctx.departmentId });
            }
        }
        return { ...base, OR: orConditions };
    }
    async getReportingUserIds(managerId) {
        return this.assignmentService.getReporteeIds(managerId);
    }
};
exports.TaskVisibilityService = TaskVisibilityService;
exports.TaskVisibilityService = TaskVisibilityService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [task_assignment_service_1.TaskAssignmentService])
], TaskVisibilityService);
//# sourceMappingURL=task-visibility.service.js.map