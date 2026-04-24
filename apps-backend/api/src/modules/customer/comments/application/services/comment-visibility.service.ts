import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { CommentVisibility, Prisma } from '@prisma/working-client';

interface UserContext {
  userId: string;
  roleLevel: number;
}

/**
 * Private comment RBAC rules:
 *
 * Who can mark as PRIVATE:
 * - Admin (level 0-1): yes → only Admins + Managers in chain see it
 * - Manager (level 2-3): yes → only Admins see it
 * - User (level 4-6): NO → rejected with 403
 *
 * Who can see PRIVATE comments:
 * - Author: always sees own comments
 * - Admin (level 0-1): sees ALL private comments
 * - Manager (level 2-3): sees private comments by users in their reporting chain
 * - User (level 4-6): cannot see private comments (except own)
 */
@Injectable()
export class CommentVisibilityService {
  constructor(private readonly prisma: PrismaService) {}

  /** Validate if user can mark a comment as private. */
  validateCanMarkPrivate(roleLevel: number): void {
    if (roleLevel >= 4) {
      throw new ForbiddenException('Users cannot mark comments as private');
    }
  }

  /** Build Prisma filter to exclude private comments the user shouldn't see. */
  async buildVisibilityFilter(ctx: UserContext): Promise<Prisma.CommentWhereInput> {
    // Admin sees everything
    if (ctx.roleLevel <= 1) {
      return { isActive: true };
    }

    // Manager sees public + own private + private from reportees
    if (ctx.roleLevel <= 3) {
      const reporteeIds = await this.getReporteeIds(ctx.userId);
      return {
        isActive: true,
        OR: [
          { visibility: CommentVisibility.PUBLIC },
          { visibility: CommentVisibility.PRIVATE, authorId: ctx.userId },
          { visibility: CommentVisibility.PRIVATE, authorId: { in: reporteeIds } },
        ],
      };
    }

    // Regular user sees public + own private only
    return {
      isActive: true,
      OR: [
        { visibility: CommentVisibility.PUBLIC },
        { visibility: CommentVisibility.PRIVATE, authorId: ctx.userId },
      ],
    };
  }

  private async getReporteeIds(managerId: string): Promise<string[]> {
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
