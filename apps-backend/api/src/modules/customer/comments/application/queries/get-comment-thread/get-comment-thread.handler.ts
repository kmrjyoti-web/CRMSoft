// @ts-nocheck
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetCommentThreadQuery } from './get-comment-thread.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { CommentVisibilityService } from '../../services/comment-visibility.service';

@QueryHandler(GetCommentThreadQuery)
export class GetCommentThreadHandler implements IQueryHandler<GetCommentThreadQuery> {
    private readonly logger = new Logger(GetCommentThreadHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly visibilityService: CommentVisibilityService,
  ) {}

  async execute(query: GetCommentThreadQuery) {
    try {
      const visibilityFilter = await this.visibilityService.buildVisibilityFilter({
        userId: query.userId,
        roleLevel: query.roleLevel,
      });

      return this.prisma.working.comment.findMany({
        where: { ...visibilityFilter, parentId: query.parentId },
        orderBy: { createdAt: 'asc' },
        include: { author: { select: { id: true, firstName: true, lastName: true } } },
      });
    } catch (error) {
      this.logger.error(`GetCommentThreadHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
