import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/prisma/prisma.service';

export const TEST_PLAN_REPOSITORY = Symbol('TEST_PLAN_REPOSITORY');

export interface ITestPlanRepository {
  create(data: CreateTestPlanData): Promise<any>;
  findById(id: string): Promise<any | null>;
  findByTenantId(tenantId: string, filters: ListTestPlanFilters): Promise<any>;
  update(id: string, data: Partial<CreateTestPlanData>): Promise<any>;
  softDelete(id: string): Promise<void>;
  recalcStats(planId: string): Promise<void>;
  // Items
  createItem(data: CreateTestPlanItemData): Promise<any>;
  findItemById(id: string): Promise<any | null>;
  updateItem(id: string, data: Partial<CreateTestPlanItemData>): Promise<any>;
  deleteItem(id: string): Promise<void>;
  // Evidence
  createEvidence(data: CreateTestEvidenceData): Promise<any>;
  deleteEvidence(id: string): Promise<void>;
}

export interface CreateTestPlanData {
  tenantId: string;
  name: string;
  description?: string;
  version?: string;
  targetModules: string[];
  createdById: string;
}

export interface CreateTestPlanItemData {
  planId: string;
  moduleName: string;
  componentName: string;
  functionality: string;
  layer: string;
  priority?: string;
  sortOrder?: number;
}

export interface CreateTestEvidenceData {
  planItemId: string;
  fileType: string;
  fileName: string;
  filePath: string;
  fileSize?: number;
  mimeType?: string;
  caption?: string;
  uploadedById?: string;
}

export interface ListTestPlanFilters {
  status?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class PrismaTestPlanRepository implements ITestPlanRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateTestPlanData): Promise<any> {
    return this.prisma.platform.testPlan.create({ data: data as any });
  }

  async findById(id: string): Promise<any | null> {
    return this.prisma.platform.testPlan.findFirst({
      where: { id, isActive: true },
      include: {
        items: {
          orderBy: { sortOrder: 'asc' },
          include: { evidences: true },
        },
      },
    });
  }

  async findByTenantId(
    tenantId: string,
    filters: ListTestPlanFilters,
  ): Promise<any> {
    const where: any = { tenantId, isActive: true };
    if (filters.status) where.status = filters.status;
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const [items, total] = await Promise.all([
      this.prisma.platform.testPlan.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { _count: { select: { items: true } } },
      }),
      this.prisma.platform.testPlan.count({ where }),
    ]);
    return { items, total };
  }

  async update(id: string, data: Partial<CreateTestPlanData>): Promise<any> {
    return this.prisma.platform.testPlan.update({ where: { id }, data: data as any });
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.platform.testPlan.update({ where: { id }, data: { isActive: false } });
  }

  async recalcStats(planId: string): Promise<void> {
    const items = await this.prisma.platform.testPlanItem.findMany({ where: { planId } });
    const total = items.length;
    const passed = items.filter(i => i.status === 'PASSED').length;
    const failed = items.filter(i => i.status === 'FAILED').length;
    const completed = items.filter(i => !['NOT_STARTED', 'IN_PROGRESS'].includes(i.status)).length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    await this.prisma.platform.testPlan.update({
      where: { id: planId },
      data: {
        totalItems: total,
        passedItems: passed,
        failedItems: failed,
        completedItems: completed,
        progress,
        status: total > 0 && completed === total
          ? (failed > 0 ? 'COMPLETED' : 'COMPLETED')
          : 'ACTIVE',
      } as any,
    });
  }

  async createItem(data: CreateTestPlanItemData): Promise<any> {
    return this.prisma.platform.testPlanItem.create({ data: data as any });
  }

  async findItemById(id: string): Promise<any | null> {
    return this.prisma.platform.testPlanItem.findUnique({
      where: { id },
      include: { evidences: true },
    });
  }

  async updateItem(id: string, data: Partial<CreateTestPlanItemData>): Promise<any> {
    return this.prisma.platform.testPlanItem.update({ where: { id }, data: data as any });
  }

  async deleteItem(id: string): Promise<void> {
    await this.prisma.platform.testPlanItem.delete({ where: { id } });
  }

  async createEvidence(data: CreateTestEvidenceData): Promise<any> {
    return this.prisma.platform.testEvidence.create({ data: data as any });
  }

  async deleteEvidence(id: string): Promise<void> {
    await this.prisma.platform.testEvidence.delete({ where: { id } });
  }
}
