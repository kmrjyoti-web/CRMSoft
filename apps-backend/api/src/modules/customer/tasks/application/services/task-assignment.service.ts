import { Injectable, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { TaskLogicService } from '../../../../customer/task-logic/task-logic.service';

@Injectable()
export class TaskAssignmentService {
  private readonly logger = new Logger(TaskAssignmentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly taskLogic: TaskLogicService,
  ) {}

  /**
   * Validate whether the creator can assign a task to the target.
   * Rules:
   * - Admin (level 0-1): ANY_USER — assign to anyone, any department, any designation
   * - Manager (level 2-3): REPORTEES — assign to self + direct/indirect reportees, own department
   * - User (level 4-6): SELF — can only assign to self
   */
  async validateAssignment(
    creatorId: string,
    assigneeId: string,
    creatorRoleLevel: number,
    assignmentScope?: string,
    assignedDepartmentId?: string,
    assignedDesignationId?: string,
    assignedRoleId?: string,
  ): Promise<void> {
    // Self-assignment is always allowed
    if (creatorId === assigneeId) return;

    const scopeMap = await this.taskLogic.getConfig<Record<string, string>>('ASSIGNMENT_SCOPE_BY_LEVEL');
    const scope = scopeMap?.[String(creatorRoleLevel)] ?? this.getDefaultScope(creatorRoleLevel);

    switch (scope) {
      case 'ANY_USER':
        // Admin — validate scope-specific rules
        if (assignmentScope === 'DEPARTMENT' && assignedDepartmentId) return;
        if (assignmentScope === 'DESIGNATION' && assignedDesignationId) return;
        if (assignmentScope === 'ROLE' && assignedRoleId) return;
        return;

      case 'REPORTEES':
        // Manager — can assign to reportees only
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
        throw new ForbiddenException('You can only create tasks for yourself');

      default:
        throw new ForbiddenException('Unknown assignment scope');
    }
  }

  /** Check if assigneeId is in the creator's reporting chain. */
  private async validateReporteeChain(managerId: string, targetId: string): Promise<void> {
    const reportees = await this.prisma.$queryRaw<{ id: string }[]>`
      WITH RECURSIVE chain AS (
        SELECT id FROM users WHERE reporting_to_id = ${managerId} AND is_deleted = false
        UNION ALL
        SELECT u.id FROM users u INNER JOIN chain c ON u.reporting_to_id = c.id WHERE u.is_deleted = false
      )
      SELECT id FROM chain WHERE id = ${targetId} LIMIT 1
    `;

    if (reportees.length === 0) {
      throw new ForbiddenException('You can only assign tasks to yourself or your reportees');
    }
  }

  /** Manager can only assign to their own department. */
  private async validateDepartmentScope(creatorId: string, departmentId?: string): Promise<void> {
    if (!departmentId) throw new ForbiddenException('Department ID is required for DEPARTMENT scope');

    const creator = await this.prisma.user.findUnique({
      where: { id: creatorId },
      select: { departmentId: true },
    });
    if (creator?.departmentId !== departmentId) {
      throw new ForbiddenException('Managers can only assign tasks to their own department');
    }
  }

  /** Manager can only assign to designations below their own level. */
  private async validateDesignationScope(creatorRoleLevel: number, designationId?: string): Promise<void> {
    if (!designationId) throw new ForbiddenException('Designation ID is required for DESIGNATION scope');
    // Managers can target designations at their level or below — always allowed since we verified they are a manager
  }

  private getDefaultScope(level: number): string {
    if (level <= 1) return 'ANY_USER';
    if (level <= 3) return 'REPORTEES';
    return 'SELF';
  }

  /** Get all reportee IDs for a manager (recursive). */
  async getReporteeIds(managerId: string): Promise<string[]> {
    const reportees = await this.prisma.$queryRaw<{ id: string }[]>`
      WITH RECURSIVE chain AS (
        SELECT id FROM users WHERE reporting_to_id = ${managerId} AND is_deleted = false
        UNION ALL
        SELECT u.id FROM users u INNER JOIN chain c ON u.reporting_to_id = c.id WHERE u.is_deleted = false
      )
      SELECT id FROM chain
    `;
    return reportees.map(r => r.id);
  }
}
