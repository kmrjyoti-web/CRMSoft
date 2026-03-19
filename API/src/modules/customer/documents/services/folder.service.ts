import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Injectable()
export class FolderService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    name: string;
    description?: string;
    parentId?: string;
    color?: string;
    icon?: string;
    createdById: string;
  }) {
    if (data.parentId) {
      const parent = await this.prisma.documentFolder.findUnique({
        where: { id: data.parentId, isActive: true },
      });
      if (!parent) throw new BadRequestException('Parent folder not found');
    }

    const maxSort = await this.prisma.documentFolder.aggregate({
      where: { parentId: data.parentId || null, isActive: true },
      _max: { sortOrder: true },
    });

    return this.prisma.documentFolder.create({
      data: {
        name: data.name,
        description: data.description,
        parentId: data.parentId,
        color: data.color,
        icon: data.icon,
        sortOrder: (maxSort._max.sortOrder || 0) + 1,
        createdById: data.createdById,
      },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { documents: true, children: true } },
      },
    });
  }

  async update(id: string, data: { name?: string; description?: string; color?: string; icon?: string }) {
    const folder = await this.prisma.documentFolder.findUnique({ where: { id, isActive: true } });
    if (!folder) throw new NotFoundException('Folder not found');

    return this.prisma.documentFolder.update({
      where: { id },
      data,
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { documents: true, children: true } },
      },
    });
  }

  async softDelete(id: string) {
    const folder = await this.prisma.documentFolder.findUnique({
      where: { id, isActive: true },
      include: { _count: { select: { documents: true, children: true } } },
    });
    if (!folder) throw new NotFoundException('Folder not found');

    if (folder._count.documents > 0 || folder._count.children > 0) {
      throw new BadRequestException('Cannot delete folder that contains documents or sub-folders. Move or delete contents first.');
    }

    return this.prisma.documentFolder.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getTree(userId?: string) {
    const where: any = { isActive: true, parentId: null };
    if (userId) where.createdById = userId;

    const roots = await this.prisma.documentFolder.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { documents: true, children: true } },
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            _count: { select: { documents: true, children: true } },
            children: {
              where: { isActive: true },
              orderBy: { sortOrder: 'asc' },
              include: {
                _count: { select: { documents: true, children: true } },
              },
            },
          },
        },
      },
    });

    return roots;
  }

  async getContents(folderId: string, page = 1, limit = 20) {
    const folder = await this.prisma.documentFolder.findUnique({
      where: { id: folderId, isActive: true },
    });
    if (!folder) throw new NotFoundException('Folder not found');

    const skip = (page - 1) * limit;

    const [subFolders, documents, totalDocs] = await Promise.all([
      this.prisma.documentFolder.findMany({
        where: { parentId: folderId, isActive: true },
        orderBy: { sortOrder: 'asc' },
        include: { _count: { select: { documents: true, children: true } } },
      }),
      this.prisma.document.findMany({
        where: { folderId, isActive: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          uploadedBy: { select: { id: true, firstName: true, lastName: true } },
          _count: { select: { attachments: true } },
        },
      }),
      this.prisma.document.count({ where: { folderId, isActive: true } }),
    ]);

    return {
      folder,
      subFolders,
      documents: { data: documents, total: totalDocs, page, limit, totalPages: Math.ceil(totalDocs / limit) },
    };
  }
}
