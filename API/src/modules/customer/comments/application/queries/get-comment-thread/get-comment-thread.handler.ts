import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCommentThreadQuery } from './get-comment-thread.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { CommentVisibilityService } from '../../services/comment-visibility.service';

@QueryHandler(GetCommentThreadQuery)
export class GetCommentThreadHandler implements IQueryHandler<GetCommentThreadQuery> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly visibilityService: CommentVisibilityService,
  ) {}

  async execute(query: GetCommentThreadQuery) {
    const visibilityFilter = await this.visibilityService.buildVisibilityFilter({
      userId: query.userId,
      roleLevel: query.roleLevel,
    });

    return this.prisma.comment.findMany({
      where: { ...visibilityFilter, parentId: query.parentId },
      orderBy: { createdAt: 'asc' },
      include: { author: { select: { id: true, firstName: true, lastName: true } } },
    });
  }
}
