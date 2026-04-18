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
var TaskAssignmentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskAssignmentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const task_logic_service_1 = require("../../../../customer/task-logic/task-logic.service");
let TaskAssignmentService = TaskAssignmentService_1 = class TaskAssignmentService {
    constructor(prisma, taskLogic) {
        this.prisma = prisma;
        this.taskLogic = taskLogic;
        this.logger = new common_1.Logger(TaskAssignmentService_1.name);
    }
    async validateAssignment(creatorId, assigneeId, creatorRoleLevel, assignmentScope, assignedDepartmentId, assignedDesignationId, assignedRoleId) {
        if (creatorId === assigneeId)
            return;
        const scopeMap = await this.taskLogic.getConfig('ASSIGNMENT_SCOPE_BY_LEVEL');
        const scope = scopeMap?.[String(creatorRoleLevel)] ?? this.getDefaultScope(creatorRoleLevel);
        switch (scope) {
            case 'ANY_USER':
                if (assignmentScope === 'DEPARTMENT' && assignedDepartmentId)
                    return;
                if (assignmentScope === 'DESIGNATION' && assignedDesignationId)
                    return;
                if (assignmentScope === 'ROLE' && assignedRoleId)
                    return;
                return;
            case 'REPORTEES':
                if (assignmentScope === 'DEPARTMENT') {
                    await this.validateDepartmentScope(creatorId, assignedDepartmentId);
                    return;
                }
                if (assignmentScope === 'DESIGNATION') {
                    await this.validateDesignationScope(creatorRoleLevel, assignedDesignationId);
                    return;
                }
                await this.validateReporteeChain(creatorId, assigneeId);
                return;
            case 'SELF':
                throw new common_1.ForbiddenException('You can only create tasks for yourself');
            default:
                throw new common_1.ForbiddenException('Unknown assignment scope');
        }
    }
    async validateReporteeChain(managerId, targetId) {
        const reportees = await this.prisma.$queryRaw `
      WITH RECURSIVE chain AS (
        SELECT id FROM users WHERE reporting_to_id = ${managerId} AND is_deleted = false
        UNION ALL
        SELECT u.id FROM users u INNER JOIN chain c ON u.reporting_to_id = c.id WHERE u.is_deleted = false
      )
      SELECT id FROM chain WHERE id = ${targetId} LIMIT 1
    `;
        if (reportees.length === 0) {
            throw new common_1.ForbiddenException('You can only assign tasks to yourself or your reportees');
        }
    }
    async validateDepartmentScope(creatorId, departmentId) {
        if (!departmentId)
            throw new common_1.ForbiddenException('Department ID is required for DEPARTMENT scope');
        const creator = await this.prisma.user.findUnique({
            where: { id: creatorId },
            select: { departmentId: true },
        });
        if (creator?.departmentId !== departmentId) {
            throw new common_1.ForbiddenException('Managers can only assign tasks to their own department');
        }
    }
    async validateDesignationScope(creatorRoleLevel, designationId) {
        if (!designationId)
            throw new common_1.ForbiddenException('Designation ID is required for DESIGNATION scope');
    }
    getDefaultScope(level) {
        if (level <= 1)
            return 'ANY_USER';
        if (level <= 3)
            return 'REPORTEES';
        return 'SELF';
    }
    async getReporteeIds(managerId) {
        const reportees = await this.prisma.$queryRaw `
      WITH RECURSIVE chain AS (
        SELECT id FROM users WHERE reporting_to_id = ${managerId} AND is_deleted = false
        UNION ALL
        SELECT u.id FROM users u INNER JOIN chain c ON u.reporting_to_id = c.id WHERE u.is_deleted = false
      )
      SELECT id FROM chain
    `;
        return reportees.map(r => r.id);
    }
};
exports.TaskAssignmentService = TaskAssignmentService;
exports.TaskAssignmentService = TaskAssignmentService = TaskAssignmentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        task_logic_service_1.TaskLogicService])
], TaskAssignmentService);
//# sourceMappingURL=task-assignment.service.js.map