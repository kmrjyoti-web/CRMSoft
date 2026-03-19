// @ts-nocheck
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCommentsByEntityQuery } from './get-comments-by-entity.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { CommentVisibilityService } from '../../services/comment-visibility.service';

@QueryHandler(GetCommentsByEntityQuery)
export class GetCommentsByEntityHandler implements IQueryHandler<GetCommentsByEntityQuery> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly visibilityService: CommentVisibilityService,
  ) {}

  async execute(query: GetCommentsByEntityQuery) {
    const visibilityFilter = await this.visibilityService.buildVisibilityFilter({
      userId: query.userId,
      roleLevel: query.roleLevel,
    });

    const where = {
      ...visibilityFilter,
      entityType: query.entityType as any,
      entityId: query.entityId,
      parentId: null, // top-level only
    };

    const skip = (query.page - 1) * query.limit;

    const [data, total] = await Promise.all([
      this.prisma.working.comment.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { id: true, firstName: true, lastName: true } },
          replies: {
            where: visibilityFilter,
            orderBy: { createdAt: 'asc' },
            include: { author: { select: { id: true, firstName: true, lastName: true } } },
          },
          _count: { select: { replies: true } },
        },
      }),
      this.prisma.working.comment.count({ where }),
    ]);

    return { data, total, page: query.page, limit: query.limit };
  }
}
