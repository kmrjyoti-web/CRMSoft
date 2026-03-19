// @ts-nocheck
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { Prisma } from '@prisma/identity-client';
import { industryFilter } from '../../../../../common/utils/industry-filter.util';

export interface PageFilters {
  portal?: string;
  category?: string;
  pageType?: string;
  moduleCode?: string;
  unassigned?: boolean;
  search?: string;
  industryCode?: string;
  page?: number;
  limit?: number;
}

export interface AssignPageDto {
  moduleCode: string;
  friendlyName?: string;
  menuIcon?: string;
  menuLabel?: string;
  menuParentKey?: string;
  menuSortOrder?: number;
  showInMenu?: boolean;
}

export interface BulkAssignDto {
  pageIds: string[];
  moduleCode: string;
}

export interface UpdatePageDto {
  friendlyName?: string;
  description?: string;
  pageType?: string;
  category?: string;
  moduleCode?: string | null;
  menuIcon?: string;
  menuLabel?: string;
  menuParentKey?: string;
  menuSortOrder?: number;
  showInMenu?: boolean;
  featuresCovered?: string[];
  apiEndpoints?: string[];
  isActive?: boolean;
  industryCode?: string | null;
}

@Injectable()
export class PageRegistryService {
  constructor(private readonly prisma: PrismaService) {}

  async list(filters: PageFilters) {
    const page = Math.max(filters.page || 1, 1);
    const limit = Math.min(Math.max(filters.limit || 20, 1), 200);
    const skip = (page - 1) * limit;

    const where: Prisma.PageRegistryWhereInput = {};

    if (filters.portal) where.portal = filters.portal;
    if (filters.category) where.category = filters.category;
    if (filters.pageType) where.pageType = filters.pageType;
    if (filters.moduleCode) where.moduleCode = filters.moduleCode;
    if (filters.unassigned) where.moduleCode = null;
    if (filters.industryCode) {
      Object.assign(where, industryFilter(filters.industryCode));
    }
    if (filters.search) {
      where.OR = [
        { friendlyName: { contains: filters.search, mode: 'insensitive' } },
        { routePath: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.platform.pageRegistry.findMany({
        where,
        orderBy: [{ portal: 'asc' }, { category: 'asc' }, { menuSortOrder: 'asc' }],
        skip,
        take: limit,
      }),
      this.prisma.platform.pageRegistry.count({ where }),
    ]);

    return { data, total };
  }

  async getById(id: string) {
    const page = await this.prisma.platform.pageRegistry.findUnique({ where: { id } });
    if (!page) throw new NotFoundException('Page not found');
    return page;
  }

  async update(id: string, dto: UpdatePageDto) {
    await this.getById(id);
    return this.prisma.platform.pageRegistry.update({ where: { id }, data: dto });
  }

  async getStats() {
    const [total, byPortal, byCategory, byPageType, unassigned, byModule] =
      await Promise.all([
        this.prisma.platform.pageRegistry.count(),
        this.prisma.platform.pageRegistry.groupBy({ by: ['portal'], _count: true }),
        this.prisma.platform.pageRegistry.groupBy({ by: ['category'], _count: true }),
        this.prisma.platform.pageRegistry.groupBy({ by: ['pageType'], _count: true }),
        this.prisma.platform.pageRegistry.count({ where: { moduleCode: null } }),
        this.prisma.platform.pageRegistry.groupBy({
          by: ['moduleCode'],
          _count: true,
          where: { moduleCode: { not: null } },
        }),
      ]);

    return {
      total,
      unassigned,
      byPortal: byPortal.map((g) => ({ portal: g.portal, count: g._count })),
      byCategory: byCategory.map((g) => ({
        category: g.category || 'Uncategorized',
        count: g._count,
      })),
      byPageType: byPageType.map((g) => ({
        pageType: g.pageType || 'Unknown',
        count: g._count,
      })),
      byModule: byModule.map((g) => ({
        moduleCode: g.moduleCode,
        count: g._count,
      })),
    };
  }

  async getUnassigned(filters: PageFilters) {
    return this.list({ ...filters, unassigned: true });
  }

  async assignToModule(id: string, dto: AssignPageDto) {
    await this.getById(id);
    return this.prisma.platform.pageRegistry.update({
      where: { id },
      data: {
        moduleCode: dto.moduleCode,
        friendlyName: dto.friendlyName,
        menuIcon: dto.menuIcon,
        menuLabel: dto.menuLabel,
        menuParentKey: dto.menuParentKey,
        menuSortOrder: dto.menuSortOrder,
        showInMenu: dto.showInMenu,
      },
    });
  }

  async bulkAssign(dto: BulkAssignDto) {
    const result = await this.prisma.platform.pageRegistry.updateMany({
      where: { id: { in: dto.pageIds } },
      data: { moduleCode: dto.moduleCode },
    });
    return { updated: result.count };
  }

  async unassignFromModule(id: string) {
    await this.getById(id);
    return this.prisma.platform.pageRegistry.update({
      where: { id },
      data: { moduleCode: null, menuKey: null },
    });
  }

  async getModulePages(moduleCode: string) {
    return this.prisma.platform.pageRegistry.findMany({
      where: { moduleCode },
      orderBy: { menuSortOrder: 'asc' },
    });
  }

  async reorderModulePages(moduleCode: string, orderedIds: string[]) {
    const updates = orderedIds.map((id, index) =>
      this.prisma.platform.pageRegistry.update({
        where: { id },
        data: { menuSortOrder: index },
      }),
    );
    await this.prisma.identity.$transaction(updates);
    return this.getModulePages(moduleCode);
  }
}
