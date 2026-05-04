import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CommentController } from './presentation/comment.controller';
import { CommentVisibilityService } from './application/services/comment-visibility.service';
import { CreateCommentHandler } from './application/commands/create-comment/create-comment.handler';
import { UpdateCommentHandler } from './application/commands/update-comment/update-comment.handler';
import { DeleteCommentHandler } from './application/commands/delete-comment/delete-comment.handler';
import { GetCommentsByEntityHandler } from './application/queries/get-comments-by-entity/get-comments-by-entity.handler';
import { GetCommentThreadHandler } from './application/queries/get-comment-thread/get-comment-thread.handler';

const CommandHandlers = [CreateCommentHandler, UpdateCommentHandler, DeleteCommentHandler];
const QueryHandlers = [GetCommentsByEntityHandler, GetCommentThreadHandler];

@Module({
  imports: [CqrsModule],
  controllers: [CommentController],
  providers: [CommentVisibilityService, ...CommandHandlers, ...QueryHandlers],
  exports: [CommentVisibilityService],
})
export class CommentsModule {}
