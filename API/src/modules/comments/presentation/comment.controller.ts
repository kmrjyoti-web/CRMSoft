import { Controller, Post, Get, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../../core/permissions/decorators/require-permissions.decorator';
import { ApiResponse } from '../../../common/utils/api-response';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateCommentCommand } from '../application/commands/create-comment/create-comment.command';
import { UpdateCommentCommand } from '../application/commands/update-comment/update-comment.command';
import { DeleteCommentCommand } from '../application/commands/delete-comment/delete-comment.command';
import { GetCommentsByEntityQuery } from '../application/queries/get-comments-by-entity/get-comments-by-entity.query';
import { GetCommentThreadQuery } from '../application/queries/get-comment-thread/get-comment-thread.query';

@Controller('comments')
export class CommentController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  @Post()
  @RequirePermissions('comments:create')
  async create(@Body() dto: CreateCommentDto, @CurrentUser() user: any) {
    const result = await this.commandBus.execute(
      new CreateCommentCommand(
        dto.entityType, dto.entityId, dto.content,
        user.id, user.roleLevel ?? 5, user.tenantId ?? '',
        dto.visibility, dto.parentId, dto.taskId,
        dto.mentionedUserIds, dto.attachments,
      ),
    );
    return ApiResponse.success(result, 'Comment created');
  }

  @Get(':entityType/:entityId')
  @RequirePermissions('comments:read')
  async getByEntity(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @CurrentUser() user: any,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ) {
    const result = await this.queryBus.execute(
      new GetCommentsByEntityQuery(entityType, entityId, user.id, user.roleLevel ?? 5, +page, +limit),
    );
    return ApiResponse.success(result);
  }

  @Get(':id/thread')
  @RequirePermissions('comments:read')
  async getThread(@Param('id') parentId: string, @CurrentUser() user: any) {
    const result = await this.queryBus.execute(
      new GetCommentThreadQuery(parentId, user.id, user.roleLevel ?? 5),
    );
    return ApiResponse.success(result);
  }

  @Put(':id')
  @RequirePermissions('comments:update')
  async update(@Param('id') id: string, @Body('content') content: string, @CurrentUser() user: any) {
    const result = await this.commandBus.execute(
      new UpdateCommentCommand(id, user.id, content, user.roleLevel ?? 5),
    );
    return ApiResponse.success(result, 'Comment updated');
  }

  @Delete(':id')
  @RequirePermissions('comments:delete')
  async delete(@Param('id') id: string, @CurrentUser() user: any) {
    const result = await this.commandBus.execute(new DeleteCommentCommand(id, user.id, user.roleLevel ?? 5));
    return ApiResponse.success(result, 'Comment deleted');
  }
}
