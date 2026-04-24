import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { helpSeedData } from './help-seed-data';

@Injectable()
export class HelpService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * List articles with filters and pagination.
   * Filters: helpType, moduleCode, screenCode, fieldCode, tags, isPublished
   */
  async listArticles(query: {
    page?: number;
    limit?: number;
    helpType?: 'DEVELOPER' | 'USER';
    moduleCode?: string;
    screenCode?: string;
    fieldCode?: string;
    tags?: string[];
    isPublished?: boolean;
    search?: string;
  }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.helpType) where.helpType = query.helpType;
    if (query.moduleCode) where.moduleCode = query.moduleCode;
    if (query.screenCode) where.screenCode = query.screenCode;
    if (query.fieldCode) where.fieldCode = query.fieldCode;
    if (query.isPublished !== undefined) where.isPublished = query.isPublished;
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { summary: { contains: query.search, mode: 'insensitive' } },
        { content: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.platform.helpArticle.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ viewCount: 'desc' }, { createdAt: 'desc' }],
        select: {
          id: true,
          articleCode: true,
          title: true,
          summary: true,
          helpType: true,
          moduleCode: true,
          screenCode: true,
          fieldCode: true,
          tags: true,
          isPublished: true,
          viewCount: true,
          helpfulCount: true,
          notHelpfulCount: true,
          videoUrl: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.platform.helpArticle.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  /** Get article by code and increment viewCount */
  async getByCode(articleCode: string) {
    const article = await this.prisma.platform.helpArticle.findUnique({
      where: { articleCode },
    });
    if (!article) throw new NotFoundException(`Help article "${articleCode}" not found`);

    // Increment view count in the background
    await this.prisma.platform.helpArticle.update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } },
    });

    return { ...article, viewCount: article.viewCount + 1 };
  }

  /**
   * Get contextual help for a specific screen/field.
   * Returns USER-type published articles matching moduleCode/screenCode/fieldCode.
   */
  async getContextual(
    moduleCode: string,
    screenCode?: string,
    fieldCode?: string,
  ) {
    const where: any = {
      helpType: 'USER',
      isPublished: true,
      moduleCode,
    };
    if (screenCode) where.screenCode = screenCode;
    if (fieldCode) where.fieldCode = fieldCode;

    const articles = await this.prisma.platform.helpArticle.findMany({
      where,
      orderBy: { viewCount: 'desc' },
      select: {
        id: true,
        articleCode: true,
        title: true,
        summary: true,
        content: true,
        videoUrl: true,
        videoThumbnail: true,
        relatedArticles: true,
        tags: true,
        usesTerminology: true,
      },
    });

    return articles;
  }

  /** Create a new help article */
  async create(data: {
    articleCode: string;
    title: string;
    content: string;
    summary: string;
    helpType: 'DEVELOPER' | 'USER';
    moduleCode?: string;
    screenCode?: string;
    fieldCode?: string;
    applicableTypes?: Record<string, unknown>;
    usesTerminology?: boolean;
    videoUrl?: string;
    videoThumbnail?: string;
    relatedArticles?: Record<string, unknown>;
    visibleToRoles?: Record<string, unknown>;
    tags?: Record<string, unknown>;
    isPublished?: boolean;
  }) {
    return this.prisma.platform.helpArticle.create({
      data: {
        articleCode: data.articleCode,
        title: data.title,
        content: data.content,
        summary: data.summary,
        helpType: data.helpType,
        moduleCode: data.moduleCode,
        screenCode: data.screenCode,
        fieldCode: data.fieldCode,
        applicableTypes: data.applicableTypes ?? ['ALL'] as any,
        usesTerminology: data.usesTerminology ?? false,
        videoUrl: data.videoUrl,
        videoThumbnail: data.videoThumbnail,
        relatedArticles: data.relatedArticles ?? [] as any,
        visibleToRoles: data.visibleToRoles ?? ['ALL'] as any,
        tags: data.tags ?? [] as any,
        isPublished: data.isPublished ?? false,
      },
    });
  }

  /** Update an existing help article */
  async update(
    id: string,
    data: Partial<{
      title: string;
      content: string;
      summary: string;
      helpType: 'DEVELOPER' | 'USER';
      moduleCode: string;
      screenCode: string;
      fieldCode: string;
      applicableTypes: Record<string, unknown>;
      usesTerminology: boolean;
      videoUrl: string;
      videoThumbnail: string;
      relatedArticles: Record<string, unknown>;
      visibleToRoles: Record<string, unknown>;
      tags: Record<string, unknown>;
      isPublished: boolean;
    }>,
  ) {
    const existing = await this.prisma.platform.helpArticle.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Help article "${id}" not found`);

    return this.prisma.platform.helpArticle.update({
      where: { id },
      data: data as any,
    });
  }

  /** Increment helpfulCount */
  async markHelpful(id: string) {
    const existing = await this.prisma.platform.helpArticle.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Help article "${id}" not found`);

    return this.prisma.platform.helpArticle.update({
      where: { id },
      data: { helpfulCount: { increment: 1 } },
    });
  }

  /** Increment notHelpfulCount */
  async markNotHelpful(id: string) {
    const existing = await this.prisma.platform.helpArticle.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Help article "${id}" not found`);

    return this.prisma.platform.helpArticle.update({
      where: { id },
      data: { notHelpfulCount: { increment: 1 } },
    });
  }

  /**
   * Replace terminology placeholders in content.
   * Supports: {product}, {contact}, {organization}, {lead}, {quotation}, {deal}, etc.
   */
  resolveTerminology(
    content: string,
    terminologyMap: Record<string, string>,
  ): string {
    let resolved = content;
    for (const [placeholder, replacement] of Object.entries(terminologyMap)) {
      const regex = new RegExp(`\\{${placeholder}\\}`, 'gi');
      resolved = resolved.replace(regex, replacement);
    }
    return resolved;
  }

  /** Seed default help articles (upsert to avoid duplicates) */
  async seedDefaults() {
    const results: { articleCode: string; action: 'created' | 'updated' }[] = [];

    for (const article of helpSeedData) {
      const existing = await this.prisma.platform.helpArticle.findUnique({
        where: { articleCode: article.articleCode },
      });

      if (existing) {
        await this.prisma.platform.helpArticle.update({
          where: { articleCode: article.articleCode },
          data: article,
        });
        results.push({ articleCode: article.articleCode, action: 'updated' });
      } else {
        await this.prisma.platform.helpArticle.create({ data: article as any });
        results.push({ articleCode: article.articleCode, action: 'created' });
      }
    }

    return { seeded: results.length, results };
  }
}
