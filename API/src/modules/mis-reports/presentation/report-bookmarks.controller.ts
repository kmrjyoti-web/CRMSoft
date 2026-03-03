import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RequirePermissions } from '../../../core/permissions/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../common/utils/api-response';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { UpdateBookmarkDto } from './dto/update-bookmark.dto';

/**
 * Controller for managing report bookmarks.
 * Users can save, list, update, and delete bookmarks that store
 * report configurations for quick access.
 */
@Controller('mis-reports/bookmarks')
@UseGuards(AuthGuard('jwt'))
export class ReportBookmarksController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new report bookmark for the current user.
   * Looks up the report definition by code and associates the bookmark.
   * @param dto - Bookmark creation data (reportCode, name, filters, isPinned)
   * @param userId - The authenticated user's ID
   * @returns The created bookmark record
   */
  @Post()
  @RequirePermissions('reports:read')
  async create(
    @Body() dto: CreateBookmarkDto,
    @CurrentUser('id') userId: string,
  ) {
    const reportDef = await this.prisma.reportDefinition.findFirst({
      where: { code: dto.reportCode },
    });

    if (!reportDef) {
      throw new NotFoundException(
        `Report definition not found: ${dto.reportCode}`,
      );
    }

    const bookmark = await this.prisma.reportBookmark.create({
      data: {
        reportDefId: reportDef.id,
        userId,
        name: dto.name,
        filters: dto.filters ?? undefined,
        isPinned: dto.isPinned ?? false,
      },
      include: { reportDef: true },
    });

    return ApiResponse.success(bookmark, 'Bookmark created');
  }

  /**
   * List all bookmarks belonging to the current user.
   * Includes the associated report definition data.
   * @param userId - The authenticated user's ID
   * @returns Array of bookmark records with report definitions
   */
  @Get()
  @RequirePermissions('reports:read')
  async list(@CurrentUser('id') userId: string) {
    const bookmarks = await this.prisma.reportBookmark.findMany({
      where: { userId },
      include: { reportDef: true },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    });

    return ApiResponse.success(bookmarks, 'Bookmarks retrieved');
  }

  /**
   * Update an existing bookmark owned by the current user.
   * Only the bookmark owner can modify it.
   * @param id - The bookmark ID to update
   * @param dto - Partial bookmark data to update
   * @param userId - The authenticated user's ID
   * @returns The updated bookmark record
   */
  @Patch(':id')
  @RequirePermissions('reports:read')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBookmarkDto,
    @CurrentUser('id') userId: string,
  ) {
    const existing = await this.prisma.reportBookmark.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new NotFoundException('Bookmark not found');
    }

    const updated = await this.prisma.reportBookmark.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.filters !== undefined && { filters: dto.filters }),
        ...(dto.isPinned !== undefined && { isPinned: dto.isPinned }),
      },
      include: { reportDef: true },
    });

    return ApiResponse.success(updated, 'Bookmark updated');
  }

  /**
   * Delete a bookmark owned by the current user.
   * Uses deleteMany with both id and userId to ensure ownership.
   * @param id - The bookmark ID to delete
   * @param userId - The authenticated user's ID
   * @returns Deletion confirmation
   */
  @Delete(':id')
  @RequirePermissions('reports:read')
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    const result = await this.prisma.reportBookmark.deleteMany({
      where: { id, userId },
    });

    if (result.count === 0) {
      throw new NotFoundException('Bookmark not found');
    }

    return ApiResponse.success(null, 'Bookmark deleted');
  }
}
