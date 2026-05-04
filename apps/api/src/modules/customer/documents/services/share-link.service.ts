// @ts-nocheck
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { ShareLinkAccess } from '@prisma/working-client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ShareLinkService {
  constructor(private readonly prisma: PrismaService) {}

  async createLink(data: {
    documentId: string;
    access?: ShareLinkAccess;
    password?: string;
    expiresAt?: Date;
    maxViews?: number;
    createdById: string;
  }) {
    const doc = await this.prisma.working.document.findUnique({
      where: { id: data.documentId, isActive: true },
    });
    if (!doc) throw new NotFoundException('Document not found');

    const token = uuidv4().replace(/-/g, '');

    return this.prisma.working.documentShareLink.create({
      data: {
        documentId: data.documentId,
        token,
        access: data.access || ShareLinkAccess.VIEW,
        password: data.password,
        expiresAt: data.expiresAt,
        maxViews: data.maxViews,
        createdById: data.createdById,
      },
      include: {
        document: { select: { id: true, originalName: true, mimeType: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async accessLink(token: string, password?: string) {
    const link = await this.prisma.working.documentShareLink.findUnique({
      where: { token },
      include: {
        document: {
          include: {
            uploadedBy: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });

    if (!link || !link.isActive) throw new NotFoundException('Share link not found or has been revoked');

    if (link.expiresAt && link.expiresAt < new Date()) {
      throw new BadRequestException('This share link has expired');
    }

    if (link.maxViews && link.viewCount >= link.maxViews) {
      throw new BadRequestException('This share link has reached its maximum view count');
    }

    if (link.password && link.password !== password) {
      throw new ForbiddenException('Invalid password');
    }

    // Increment view count
    await this.prisma.working.documentShareLink.update({
      where: { id: link.id },
      data: { viewCount: { increment: 1 } },
    });

    return {
      document: link.document,
      access: link.access,
    };
  }

  async revokeLink(linkId: string, userId: string) {
    const link = await this.prisma.working.documentShareLink.findUnique({
      where: { id: linkId },
    });
    if (!link) throw new NotFoundException('Share link not found');
    if (link.createdById !== userId) throw new ForbiddenException('You can only revoke your own share links');

    return this.prisma.working.documentShareLink.update({
      where: { id: linkId },
      data: { isActive: false },
    });
  }

  async getDocumentLinks(documentId: string) {
    return this.prisma.working.documentShareLink.findMany({
      where: { documentId, isActive: true },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
