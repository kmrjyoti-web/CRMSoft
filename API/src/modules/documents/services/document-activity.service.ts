import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';

export type DocumentActionType =
  | 'UPLOADED'
  | 'VIEWED'
  | 'DOWNLOADED'
  | 'UPDATED'
  | 'DELETED'
  | 'RESTORED'
  | 'MOVED'
  | 'ATTACHED'
  | 'DETACHED'
  | 'VERSION_CREATED'
  | 'SHARED'
  | 'SHARE_REVOKED'
  | 'SHARE_ACCESSED';

@Injectable()
export class DocumentActivityService {
  constructor(private readonly prisma: PrismaService) {}

  async log(data: {
    documentId: string;
    action: DocumentActionType;
    userId: string;
    details?: Record<string, any>;
    ipAddress?: string;
  }) {
    return this.prisma.documentActivity.create({
      data: {
        documentId: data.documentId,
        action: data.action,
        userId: data.userId,
        details: data.details || {},
        ipAddress: data.ipAddress,
      },
    });
  }

  async getDocumentActivity(documentId: string, page = 1, limit = 20) {
    const where = { documentId };
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.documentActivity.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      this.prisma.documentActivity.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getUserActivity(userId: string, page = 1, limit = 20) {
    const where = { userId };
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.documentActivity.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          document: { select: { id: true, originalName: true, mimeType: true } },
        },
      }),
      this.prisma.documentActivity.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
