import {
  Controller, Get, Post, Put, Delete, Param, Query, Body,
  UseGuards, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../../../core/permissions/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../common/utils/api-response';
import { UploadDocumentCommand } from '../application/commands/upload-document/upload-document.command';
import { UpdateDocumentCommand } from '../application/commands/update-document/update-document.command';
import { DeleteDocumentCommand } from '../application/commands/delete-document/delete-document.command';
import { MoveDocumentCommand } from '../application/commands/move-document/move-document.command';
import { UploadVersionCommand } from '../application/commands/upload-version/upload-version.command';
import { LinkCloudFileCommand } from '../application/commands/link-cloud-file/link-cloud-file.command';
import { GetDocumentListQuery } from '../application/queries/get-document-list/get-document-list.query';
import { GetDocumentByIdQuery } from '../application/queries/get-document-by-id/get-document-by-id.query';
import { GetDocumentVersionsQuery } from '../application/queries/get-document-versions/get-document-versions.query';
import { GetDocumentStatsQuery } from '../application/queries/get-document-stats/get-document-stats.query';
import { GetDocumentActivityQuery } from '../application/queries/get-document-activity/get-document-activity.query';
import { SearchDocumentsQuery } from '../application/queries/search-documents/search-documents.query';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { DocumentQueryDto } from './dto/document-query.dto';
import { LinkCloudFileDto } from './dto/cloud.dto';
import { SearchDocumentsDto } from './dto/search.dto';

@ApiTags('Documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('upload')
  @RequirePermissions('documents:create')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
    @CurrentUser('id') userId: string,
  ) {
    const result = await this.commandBus.execute(
      new UploadDocumentCommand(file, userId, dto.category, dto.description, dto.tags, dto.folderId),
    );
    return ApiResponse.success(result, 'Document uploaded successfully');
  }

  @Post('link-cloud')
  @RequirePermissions('documents:create')
  async linkCloud(@Body() dto: LinkCloudFileDto, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(
      new LinkCloudFileCommand(dto.url, userId, dto.category, dto.description, dto.tags, dto.folderId),
    );
    return ApiResponse.success(result, 'Cloud file linked successfully');
  }

  @Get()
  @RequirePermissions('documents:read')
  async list(@Query() dto: DocumentQueryDto) {
    const result = await this.queryBus.execute(
      new GetDocumentListQuery(
        dto.page, dto.limit, dto.search, dto.category, dto.storageType,
        dto.folderId, dto.uploadedById, dto.tags,
      ),
    );
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  @Get('search')
  @RequirePermissions('documents:read')
  async search(@Query() dto: SearchDocumentsDto) {
    const result = await this.queryBus.execute(
      new SearchDocumentsQuery(
        dto.query || '', dto.page, dto.limit, dto.category, dto.storageType,
        dto.tags, dto.uploadedById,
        dto.dateFrom ? new Date(dto.dateFrom) : undefined,
        dto.dateTo ? new Date(dto.dateTo) : undefined,
        dto.mimeType, dto.minSize, dto.maxSize,
      ),
    );
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  @Get('stats')
  @RequirePermissions('documents:read')
  async stats(@Query('userId') userId?: string) {
    const result = await this.queryBus.execute(new GetDocumentStatsQuery(userId));
    return ApiResponse.success(result);
  }

  @Get(':id')
  @RequirePermissions('documents:read')
  async getById(@Param('id') id: string) {
    const result = await this.queryBus.execute(new GetDocumentByIdQuery(id));
    return ApiResponse.success(result);
  }

  @Put(':id')
  @RequirePermissions('documents:update')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDocumentDto,
    @CurrentUser('id') userId: string,
  ) {
    const result = await this.commandBus.execute(
      new UpdateDocumentCommand(id, userId, dto.description, dto.category, dto.tags),
    );
    return ApiResponse.success(result, 'Document updated successfully');
  }

  @Delete(':id')
  @RequirePermissions('documents:delete')
  async delete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    await this.commandBus.execute(new DeleteDocumentCommand(id, userId));
    return ApiResponse.success(null, 'Document deleted successfully');
  }

  @Post(':id/move')
  @RequirePermissions('documents:update')
  async move(
    @Param('id') id: string,
    @Body('folderId') folderId: string | null,
    @CurrentUser('id') userId: string,
  ) {
    const result = await this.commandBus.execute(new MoveDocumentCommand(id, folderId, userId));
    return ApiResponse.success(result, 'Document moved successfully');
  }

  @Post(':id/versions')
  @RequirePermissions('documents:create')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  async uploadVersion(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('id') userId: string,
  ) {
    const result = await this.commandBus.execute(new UploadVersionCommand(id, file, userId));
    return ApiResponse.success(result, 'New version uploaded successfully');
  }

  @Get(':id/versions')
  @RequirePermissions('documents:read')
  async getVersions(@Param('id') id: string) {
    const result = await this.queryBus.execute(new GetDocumentVersionsQuery(id));
    return ApiResponse.success(result);
  }

  @Get(':id/activity')
  @RequirePermissions('documents:read')
  async getActivity(
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const result = await this.queryBus.execute(new GetDocumentActivityQuery(id, page || 1, limit || 20));
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }
}
