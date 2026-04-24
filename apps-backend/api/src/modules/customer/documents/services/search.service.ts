// @ts-nocheck
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { DocumentCategory, StorageType } from '@prisma/working-client';

@Injectable()
export class DocumentSearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(params: {
    query: string;
    category?: DocumentCategory;
    storageType?: StorageType;
    tags?: string[];
    uploadedById?: string;
    dateFrom?: Date;
    dateTo?: Date;
    mimeType?: string;
    minSize?: number;
    maxSize?: number;
    page?: number;
    limit?: number;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { isActive: true };

    if (params.query) {
      where.OR = [
        { originalName: { contains: params.query, mode: 'insensitive' } },
        { description: { contains: params.query, mode: 'insensitive' } },
        { tags: { hasSome: [params.query.toLowerCase()] } },
      ];
    }

    if (params.category) where.category = params.category;
    if (params.storageType) where.storageType = params.storageType;
    if (params.tags?.length) where.tags = { hasSome: params.tags };
    if (params.uploadedById) where.uploadedById = params.uploadedById;
    if (params.mimeType) where.mimeType = { contains: params.mimeType };

    if (params.dateFrom || params.dateTo) {
      where.createdAt = {};
      if (params.dateFrom) where.createdAt.gte = params.dateFrom;
      if (params.dateTo) where.createdAt.lte = params.dateTo;
    }

    if (params.minSize || params.maxSize) {
      where.fileSize = {};
      if (params.minSize) where.fileSize.gte = params.minSize;
      if (params.maxSize) where.fileSize.lte = params.maxSize;
    }

    const [data, total] = await Promise.all([
      this.prisma.working.document.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          uploadedBy: { select: { id: true, firstName: true, lastName: true } },
          folder: { select: { id: true, name: true } },
          _count: { select: { attachments: true } },
        },
      }),
      this.prisma.working.document.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
