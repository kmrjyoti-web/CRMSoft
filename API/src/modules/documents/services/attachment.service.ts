import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';

const VALID_ENTITY_TYPES = ['LEAD', 'CONTACT', 'ORGANIZATION', 'QUOTATION', 'DEAL', 'ACTIVITY', 'DEMO'];

@Injectable()
export class AttachmentService {
  constructor(private readonly prisma: PrismaService) {}

  async attachDocument(documentId: string, entityType: string, entityId: string, userId: string) {
    if (!VALID_ENTITY_TYPES.includes(entityType)) {
      throw new BadRequestException(`Invalid entity type: ${entityType}. Allowed: ${VALID_ENTITY_TYPES.join(', ')}`);
    }

    const doc = await this.prisma.document.findUnique({ where: { id: documentId, isActive: true } });
    if (!doc) throw new NotFoundException('Document not found');

    const existing = await this.prisma.documentAttachment.findFirst({
      where: { documentId, entityType, entityId },
    });
    if (existing) throw new BadRequestException('Document is already attached to this entity');

    return this.prisma.documentAttachment.create({
      data: {
        documentId,
        entityType,
        entityId,
        attachedById: userId,
      },
      include: {
        document: {
          select: { id: true, originalName: true, mimeType: true, fileSize: true, category: true },
        },
        attachedBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async detachDocument(documentId: string, entityType: string, entityId: string) {
    const attachment = await this.prisma.documentAttachment.findFirst({
      where: { documentId, entityType, entityId },
    });
    if (!attachment) throw new NotFoundException('Attachment not found');

    return this.prisma.documentAttachment.delete({
      where: { id: attachment.id },
    });
  }

  async getEntityDocuments(entityType: string, entityId: string, page = 1, limit = 20) {
    const where = { entityType, entityId };
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.documentAttachment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          document: {
            select: {
              id: true, originalName: true, fileName: true, mimeType: true,
              fileSize: true, category: true, storageType: true, storageUrl: true,
              thumbnailUrl: true, createdAt: true,
              uploadedBy: { select: { id: true, firstName: true, lastName: true } },
            },
          },
          attachedBy: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      this.prisma.documentAttachment.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getDocumentEntities(documentId: string) {
    return this.prisma.documentAttachment.findMany({
      where: { documentId },
      select: {
        id: true,
        entityType: true,
        entityId: true,
        attachedBy: { select: { id: true, firstName: true, lastName: true } },
        createdAt: true,
      },
    });
  }
}
