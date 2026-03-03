import { Controller, Get, Post, Put, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../../../core/permissions/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../common/utils/api-response';
import { CreateFolderCommand } from '../application/commands/create-folder/create-folder.command';
import { UpdateFolderCommand } from '../application/commands/update-folder/update-folder.command';
import { DeleteFolderCommand } from '../application/commands/delete-folder/delete-folder.command';
import { GetFolderTreeQuery } from '../application/queries/get-folder-tree/get-folder-tree.query';
import { GetFolderContentsQuery } from '../application/queries/get-folder-contents/get-folder-contents.query';
import { CreateFolderDto, UpdateFolderDto } from './dto/folder.dto';

@ApiTags('Document Folders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('document-folders')
export class FolderController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @RequirePermissions('documents:create')
  async create(@Body() dto: CreateFolderDto, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(
      new CreateFolderCommand(dto.name, userId, dto.description, dto.parentId, dto.color, dto.icon),
    );
    return ApiResponse.success(result, 'Folder created successfully');
  }

  @Get('tree')
  @RequirePermissions('documents:read')
  async getTree(@Query('userId') userId?: string) {
    const result = await this.queryBus.execute(new GetFolderTreeQuery(userId));
    return ApiResponse.success(result);
  }

  @Get(':id/contents')
  @RequirePermissions('documents:read')
  async getContents(
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const result = await this.queryBus.execute(new GetFolderContentsQuery(id, page || 1, limit || 20));
    return ApiResponse.success(result);
  }

  @Put(':id')
  @RequirePermissions('documents:update')
  async update(@Param('id') id: string, @Body() dto: UpdateFolderDto) {
    const result = await this.commandBus.execute(
      new UpdateFolderCommand(id, dto.name, dto.description, dto.color, dto.icon),
    );
    return ApiResponse.success(result, 'Folder updated successfully');
  }

  @Delete(':id')
  @RequirePermissions('documents:delete')
  async delete(@Param('id') id: string) {
    await this.commandBus.execute(new DeleteFolderCommand(id));
    return ApiResponse.success(null, 'Folder deleted successfully');
  }
}
