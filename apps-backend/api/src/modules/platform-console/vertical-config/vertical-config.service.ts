import { Injectable, NotFoundException } from '@nestjs/common';
import { PlatformConsolePrismaService } from '../prisma/platform-console-prisma.service';

@Injectable()
export class VerticalConfigService {
  constructor(private readonly db: PlatformConsolePrismaService) {}

  listAll() {
    return this.db.pcVerticalV2.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { modules: true, menus: true, features: true } },
      },
    });
  }

  async getComplete(verticalCode: string) {
    const v = await this.db.pcVerticalV2.findUnique({
      where: { verticalCode },
      include: {
        modules: { orderBy: { sortOrder: 'asc' } },
        menus: {
          orderBy: { sortOrder: 'asc' },
          include: { module: { select: { moduleCode: true, displayName: true } } },
        },
        features: {
          include: { module: { select: { moduleCode: true, displayName: true } } },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
    if (!v) throw new NotFoundException(`Vertical '${verticalCode}' not found`);
    return v;
  }

  async getModules(verticalCode: string) {
    const v = await this._findVertical(verticalCode);
    return this.db.pcVerticalModule.findMany({
      where: { verticalId: v.id },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { features: true, menus: true } },
      },
    });
  }

  async getMenuTree(verticalCode: string) {
    const v = await this._findVertical(verticalCode);
    const menus = await this.db.pcVerticalMenu.findMany({
      where: { verticalId: v.id },
      orderBy: { sortOrder: 'asc' },
      include: { module: { select: { moduleCode: true, displayName: true } } },
    });
    return this._buildTree(menus);
  }

  async getFeaturesGrouped(verticalCode: string) {
    const v = await this._findVertical(verticalCode);
    const features = await this.db.pcVerticalFeature.findMany({
      where: { verticalId: v.id },
      orderBy: { sortOrder: 'asc' },
      include: { module: { select: { moduleCode: true, displayName: true } } },
    });
    const grouped: Record<string, typeof features> = {};
    for (const f of features) {
      const key = f.module?.moduleCode ?? '_cross_cutting';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(f);
    }
    return grouped;
  }

  async getBrandConfig(verticalCode: string, brandCode: string) {
    const v = await this._findVertical(verticalCode);
    return this.db.pcBrandVerticalConfig.findUnique({
      where: { brandCode_verticalId: { brandCode, verticalId: v.id } },
    });
  }

  async upsertBrandConfig(verticalCode: string, brandCode: string, data: Record<string, unknown>) {
    const v = await this._findVertical(verticalCode);
    return this.db.pcBrandVerticalConfig.upsert({
      where: { brandCode_verticalId: { brandCode, verticalId: v.id } },
      update: data,
      create: { brandCode, verticalId: v.id, ...data } as any,
    });
  }

  private async _findVertical(verticalCode: string) {
    const v = await this.db.pcVerticalV2.findUnique({ where: { verticalCode } });
    if (!v) throw new NotFoundException(`Vertical '${verticalCode}' not found`);
    return v;
  }

  private _buildTree(menus: any[], parentId: string | null = null): any[] {
    return menus
      .filter(m => m.parentMenuId === parentId)
      .map(m => ({ ...m, children: this._buildTree(menus, m.id) }));
  }
}
