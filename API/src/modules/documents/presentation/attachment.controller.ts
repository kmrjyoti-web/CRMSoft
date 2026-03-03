import { Controller, Get, Post, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../../../core/permissions/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../common/utils/api-response';
import { AttachDocumentCommand } from '../application/commands/attach-document/attach-document.command';
import { DetachDocumentCommand } from '../application/commands/detach-document/detach-document.command';
import { GetEntityDocumentsQuery } from '../application/queries/get-entity-documents/get-entity-documents.query';
import { AttachDocumentDto } from './dto/attachment.dto';

@ApiTags('Document Attachments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('document-attachments')
export class AttachmentController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @RequirePermissions('documents:create')
  async attach(@Body() dto: AttachDocumentDto, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(
      new AttachDocumentCommand(dto.documentId, dto.entityType, dto.entityId, userId),
    );
    return ApiResponse.success(result, 'Document attached successfully');
  }

  @Delete(':documentId/:entityType/:entityId')
  @RequirePermissions('documents:delete')
  async detach(
    @Param('documentId') documentId: string,
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.commandBus.execute(
      new DetachDocumentCommand(documentId, entityType, entityId, userId),
    );
    return ApiResponse.success(null, 'Document detached successfully');
  }

  @Get('entity/:entityType/:entityId')
  @RequirePermissions('documents:read')
  async getEntityDocuments(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const result = await this.queryBus.execute(
      new GetEntityDocumentsQuery(entityType, entityId, page || 1, limit || 20),
    );
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }
}
