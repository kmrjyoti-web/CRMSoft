import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { StorageType, StorageProvider, DocumentStatus, DocumentCategory } from '@prisma/client';

@Injectable()
export class DocumentService {
  constructor(private readonly prisma: PrismaService) {}

  async createDocument(data: {
    fileName: string;
    originalName: string;
    mimeType: string;
    fileSize: number;
    storageType: StorageType;
    storageProvider?: StorageProvider;
    storagePath?: string;
    storageUrl?: string;
    cloudFileId?: string;
    thumbnailUrl?: string;
    category?: DocumentCategory;
    description?: string;
    tags?: string[];
    folderId?: string;
    uploadedById: string;
  }) {
    if (data.folderId) {
      const folder = await this.prisma.documentFolder.findUnique({
        where: { id: data.folderId, isActive: true },
      });
      if (!folder) throw new BadRequestException('Folder not found');
    }

    return this.prisma.document.create({
      data: {
        fileName: data.fileName,
        originalName: data.originalName,
        mimeType: data.mimeType,
        fileSize: data.fileSize,
        storageType: data.storageType,
        storageProvider: data.storageProvider || StorageProvider.NONE,
        storagePath: data.storagePath,
        storageUrl: data.storageUrl,
        cloudFileId: data.cloudFileId,
        thumbnailUrl: data.thumbnailUrl,
        category: data.category || DocumentCategory.GENERAL,
        description: data.description,
        tags: data.tags || [],
        folderId: data.folderId,
        uploadedById: data.uploadedById,
      },
      include: {
        uploadedBy: { select: { id: true, firstName: true, lastName: true } },
        folder: { select: { id: true, name: true } },
      },
    });
  }

  async getById(id: string) {
    const doc = await this.prisma.document.findUnique({
      where: { id, isActive: true },
      include: {
        uploadedBy: { select: { id: true, firstName: true, lastName: true } },
        folder: { select: { id: true, name: true } },
        attachments: {
          include: { attachedBy: { select: { id: true, firstName: true, lastName: true } } },
        },
        shareLinks: { where: { isActive: true } },
        _count: { select: { childVersions: true, activityLogs: true } },
      },
    });
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async getList(params: {
    page: number;
    limit: number;
    search?: string;
    category?: DocumentCategory;
    storageType?: StorageType;
    folderId?: string;
    uploadedById?: string;
    tags?: string[];
  }) {
    const where: any = { isActive: true, status: DocumentStatus.ACTIVE };

    if (params.search) {
      where.OR = [
        { originalName: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
      ];
    }
    if (params.category) where.category = params.category;
    if (params.storageType) where.storageType = params.storageType;
    if (params.folderId) where.folderId = params.folderId;
    if (params.uploadedById) where.uploadedById = params.uploadedById;
    if (params.tags?.length) where.tags = { hasSome: params.tags };

    const skip = (params.page - 1) * params.limit;
    const [data, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        skip,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          uploadedBy: { select: { id: true, firstName: true, lastName: true } },
          folder: { select: { id: true, name: true } },
          _count: { select: { attachments: true } },
        },
      }),
      this.prisma.document.count({ where }),
    ]);

    return { data, total, page: params.page, limit: params.limit, totalPages: Math.ceil(total / params.limit) };
  }

  async updateDocument(id: string, data: {
    description?: string;
    category?: DocumentCategory;
    tags?: string[];
    folderId?: string | null;
  }) {
    await this.getById(id);
    return this.prisma.document.update({
      where: { id },
      data,
      include: {
        uploadedBy: { select: { id: true, firstName: true, lastName: true } },
        folder: { select: { id: true, name: true } },
      },
    });
  }

  async softDelete(id: string) {
    await this.getById(id);
    return this.prisma.document.update({
      where: { id },
      data: { isActive: false, status: DocumentStatus.DELETED },
    });
  }

  async moveToFolder(id: string, folderId: string | null) {
    await this.getById(id);
    if (folderId) {
      const folder = await this.prisma.documentFolder.findUnique({
        where: { id: folderId, isActive: true },
      });
      if (!folder) throw new BadRequestException('Target folder not found');
    }
    return this.prisma.document.update({
      where: { id },
      data: { folderId },
    });
  }

  async getVersions(documentId: string) {
    const doc = await this.getById(documentId);
    // Find the root version (the first version with no parentVersionId, or trace back)
    let rootId = doc.id;
    if (doc.parentVersionId) {
      // Trace back to the root
      let current = doc;
      while (current.parentVersionId) {
        const parent = await this.prisma.document.findUnique({ where: { id: current.parentVersionId } });
        if (!parent) break;
        rootId = parent.id;
        current = parent as any;
      }
    }

    // Get all versions in the chain
    const versions = await this.prisma.document.findMany({
      where: {
        OR: [
          { id: rootId },
          { parentVersionId: rootId },
        ],
        isActive: true,
      },
      orderBy: { version: 'asc' },
      select: {
        id: true, version: true, fileName: true, originalName: true,
        fileSize: true, mimeType: true, createdAt: true,
        uploadedBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return versions;
  }

  async createVersion(parentId: string, data: {
    fileName: string;
    originalName: string;
    mimeType: string;
    fileSize: number;
    storageType: StorageType;
    storagePath?: string;
    storageUrl?: string;
    uploadedById: string;
  }) {
    const parent = await this.getById(parentId);
    const latestVersion = await this.prisma.document.findFirst({
      where: {
        OR: [{ id: parentId }, { parentVersionId: parentId }],
        isActive: true,
      },
      orderBy: { version: 'desc' },
    });

    const nextVersion = (latestVersion?.version || parent.version) + 1;

    return this.prisma.document.create({
      data: {
        ...data,
        storageProvider: parent.storageProvider,
        category: parent.category,
        description: parent.description,
        tags: parent.tags,
        folderId: parent.folderId,
        version: nextVersion,
        parentVersionId: parent.parentVersionId || parent.id,
      },
      include: {
        uploadedBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async getStats(userId?: string) {
    const where: any = { isActive: true };
    if (userId) where.uploadedById = userId;

    const [totalDocuments, totalSize, byCategory, byStorageType] = await Promise.all([
      this.prisma.document.count({ where }),
      this.prisma.document.aggregate({ where, _sum: { fileSize: true } }),
      this.prisma.document.groupBy({ by: ['category'], where, _count: { id: true } }),
      this.prisma.document.groupBy({ by: ['storageType'], where, _count: { id: true } }),
    ]);

    return {
      totalDocuments,
      totalSizeBytes: totalSize._sum.fileSize || 0,
      totalSizeMB: Math.round((totalSize._sum.fileSize || 0) / (1024 * 1024) * 100) / 100,
      byCategory: byCategory.map(c => ({ category: c.category, count: c._count.id })),
      byStorageType: byStorageType.map(s => ({ storageType: s.storageType, count: s._count.id })),
    };
  }

  categorizeByMimeType(mimeType: string): DocumentCategory {
    if (mimeType.startsWith('image/')) return DocumentCategory.IMAGE;
    if (mimeType.startsWith('video/')) return DocumentCategory.VIDEO;
    if (mimeType.startsWith('audio/')) return DocumentCategory.AUDIO;
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType === 'text/csv')
      return DocumentCategory.SPREADSHEET;
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint'))
      return DocumentCategory.PRESENTATION;
    if (mimeType === 'application/pdf') return DocumentCategory.GENERAL;
    return DocumentCategory.OTHER;
  }
}
