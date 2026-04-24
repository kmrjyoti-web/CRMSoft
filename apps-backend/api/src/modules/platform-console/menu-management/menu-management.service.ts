import { Injectable, Logger, HttpException } from '@nestjs/common';
import { PlatformConsolePrismaService } from '../prisma/platform-console-prisma.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { SetBrandOverrideDto } from './dto/set-brand-override.dto';
import { MENU_MANAGEMENT_ERRORS } from './menu-management.errors';

export type MenuTreeNode = {
  id: string;
  menuKey: string;
  label: string;
  labelHi: string;
  icon?: string;
  route?: string;
  moduleCode?: string;
  verticalType?: string;
  sortOrder: number;
  isActive: boolean;
  children: MenuTreeNode[];
};

@Injectable()
export class MenuManagementService {
  private readonly logger = new Logger(MenuManagementService.name);

  constructor(private readonly db: PlatformConsolePrismaService) {}

  async getMenuTree(): Promise<MenuTreeNode[]> {
    try {
      const items = await this.db.globalMenuConfig.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      });

      return this.buildTree(items);
    } catch (error) {
      this.logger.error('Failed to get menu tree', (error as Error).stack);
      throw error;
    }
  }

  async getMenuFlat() {
    try {
      return await this.db.globalMenuConfig.findMany({
        orderBy: { sortOrder: 'asc' },
      });
    } catch (error) {
      this.logger.error('Failed to get flat menu', (error as Error).stack);
      throw error;
    }
  }

  async createMenuItem(dto: CreateMenuItemDto) {
    try {
      const existing = await this.db.globalMenuConfig.findUnique({
        where: { menuKey: dto.menuKey },
      });
      if (existing) {
        const err = MENU_MANAGEMENT_ERRORS.DUPLICATE_KEY;
        throw new HttpException({ code: err.code, message: err.message, messageHi: err.messageHi }, err.statusCode);
      }

      if (dto.parentKey) {
        const parent = await this.db.globalMenuConfig.findUnique({
          where: { menuKey: dto.parentKey },
        });
        if (!parent) {
          const err = MENU_MANAGEMENT_ERRORS.PARENT_NOT_FOUND;
          throw new HttpException({ code: err.code, message: err.message, messageHi: err.messageHi }, err.statusCode);
        }
      }

      // Auto sortOrder: count siblings + 1
      if (dto.sortOrder === undefined) {
        const siblingCount = await this.db.globalMenuConfig.count({
          where: { parentKey: dto.parentKey || null },
        });
        dto.sortOrder = siblingCount + 1;
      }

      return await this.db.globalMenuConfig.create({
        data: {
          menuKey: dto.menuKey,
          label: dto.label,
          labelHi: dto.labelHi,
          icon: dto.icon || null,
          parentKey: dto.parentKey || null,
          route: dto.route || null,
          moduleCode: dto.moduleCode || null,
          verticalType: dto.verticalType || null,
          sortOrder: dto.sortOrder,
        },
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error('Failed to create menu item', (error as Error).stack);
      throw error;
    }
  }

  async updateMenuItem(id: string, dto: UpdateMenuItemDto) {
    try {
      const item = await this.db.globalMenuConfig.findUnique({ where: { id } });
      if (!item) {
        const err = MENU_MANAGEMENT_ERRORS.MENU_NOT_FOUND;
        throw new HttpException({ code: err.code, message: err.message, messageHi: err.messageHi }, err.statusCode);
      }

      if (dto.parentKey !== undefined && dto.parentKey === item.menuKey) {
        const err = MENU_MANAGEMENT_ERRORS.CIRCULAR_PARENT;
        throw new HttpException({ code: err.code, message: err.message, messageHi: err.messageHi }, err.statusCode);
      }

      return await this.db.globalMenuConfig.update({
        where: { id },
        data: {
          ...(dto.label !== undefined && { label: dto.label }),
          ...(dto.labelHi !== undefined && { labelHi: dto.labelHi }),
          ...(dto.icon !== undefined && { icon: dto.icon }),
          ...(dto.parentKey !== undefined && { parentKey: dto.parentKey }),
          ...(dto.route !== undefined && { route: dto.route }),
          ...(dto.moduleCode !== undefined && { moduleCode: dto.moduleCode }),
          ...(dto.verticalType !== undefined && { verticalType: dto.verticalType }),
          ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
          ...(dto.isActive !== undefined && { isActive: dto.isActive }),
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Failed to update menu item: ${id}`, (error as Error).stack);
      throw error;
    }
  }

  async deleteMenuItem(id: string) {
    try {
      return await this.db.globalMenuConfig.update({
        where: { id },
        data: { isActive: false, updatedAt: new Date() },
      });
    } catch (error) {
      this.logger.error(`Failed to delete menu item: ${id}`, (error as Error).stack);
      throw error;
    }
  }

  async reorderMenuItems(items: Array<{ id: string; sortOrder: number; parentKey?: string }>) {
    try {
      await this.db.$transaction(
        items.map((item) =>
          this.db.globalMenuConfig.update({
            where: { id: item.id },
            data: {
              sortOrder: item.sortOrder,
              ...(item.parentKey !== undefined && { parentKey: item.parentKey }),
              updatedAt: new Date(),
            },
          }),
        ),
      );
      return { success: true, updated: items.length };
    } catch (error) {
      this.logger.error('Failed to reorder menu items', (error as Error).stack);
      throw error;
    }
  }

  async getMenuWithBrandOverrides(brandId: string): Promise<MenuTreeNode[]> {
    try {
      const items = await this.db.globalMenuConfig.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      });

      const overrides = await this.db.brandMenuOverride.findMany({
        where: { brandId },
      });

      const whitelistedModules = await this.db.brandModuleWhitelist.findMany({
        where: { brandId },
      });
      const whitelistedCodes = new Set(whitelistedModules.map((m) => m.moduleCode));

      const overrideMap = new Map(overrides.map((o) => [o.menuKey, o]));

      // Apply overrides and filter
      const filteredItems = items
        .filter((item) => {
          const override = overrideMap.get(item.menuKey);
          if (override?.isHidden) return false;
          // Hide menus whose moduleCode is not whitelisted (if moduleCode is set and whitelist is not empty)
          if (item.moduleCode && whitelistedCodes.size > 0 && !whitelistedCodes.has(item.moduleCode)) {
            return false;
          }
          return true;
        })
        .map((item) => {
          const override = overrideMap.get(item.menuKey);
          if (override) {
            return {
              ...item,
              label: override.customLabel || item.label,
              icon: override.customIcon || item.icon,
              sortOrder: override.sortOrder ?? item.sortOrder,
            };
          }
          return item;
        });

      return this.buildTree(filteredItems);
    } catch (error) {
      this.logger.error(`Failed to get menu with brand overrides: ${brandId}`, (error as Error).stack);
      throw error;
    }
  }

  async setBrandOverride(brandId: string, dto: SetBrandOverrideDto) {
    try {
      const menuExists = await this.db.globalMenuConfig.findUnique({
        where: { menuKey: dto.menuKey },
      });
      if (!menuExists) {
        const err = MENU_MANAGEMENT_ERRORS.MENU_NOT_FOUND;
        throw new HttpException({ code: err.code, message: err.message, messageHi: err.messageHi }, err.statusCode);
      }

      return await this.db.brandMenuOverride.upsert({
        where: { brandId_menuKey: { brandId, menuKey: dto.menuKey } },
        update: {
          customLabel: dto.customLabel,
          customIcon: dto.customIcon,
          isHidden: dto.isHidden ?? false,
          sortOrder: dto.sortOrder,
        },
        create: {
          brandId,
          menuKey: dto.menuKey,
          customLabel: dto.customLabel,
          customIcon: dto.customIcon,
          isHidden: dto.isHidden ?? false,
          sortOrder: dto.sortOrder,
        },
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Failed to set brand override: ${brandId}`, (error as Error).stack);
      throw error;
    }
  }

  async updateBrandOverride(id: string, data: { customLabel?: string; customIcon?: string; isHidden?: boolean; sortOrder?: number }) {
    try {
      return await this.db.brandMenuOverride.update({
        where: { id },
        data: {
          ...(data.customLabel !== undefined && { customLabel: data.customLabel }),
          ...(data.customIcon !== undefined && { customIcon: data.customIcon }),
          ...(data.isHidden !== undefined && { isHidden: data.isHidden }),
          ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
        },
      });
    } catch (error) {
      this.logger.error(`Failed to update brand override: ${id}`, (error as Error).stack);
      throw error;
    }
  }

  async removeBrandOverride(id: string) {
    try {
      return await this.db.brandMenuOverride.delete({ where: { id } });
    } catch (error) {
      this.logger.error(`Failed to remove brand override: ${id}`, (error as Error).stack);
      throw error;
    }
  }

  async getBrandOverrides(brandId: string) {
    try {
      return await this.db.brandMenuOverride.findMany({
        where: { brandId },
      });
    } catch (error) {
      this.logger.error(`Failed to get brand overrides: ${brandId}`, (error as Error).stack);
      throw error;
    }
  }

  async previewMenu(brandId: string, role?: string): Promise<MenuTreeNode[]> {
    try {
      const menu = await this.getMenuWithBrandOverrides(brandId);
      // Role-based filtering is future work — for now return the brand menu as-is
      if (role) {
        this.logger.log(`Preview requested for role=${role} — role filtering not yet implemented`);
      }
      return menu;
    } catch (error) {
      this.logger.error(`Failed to preview menu: ${brandId}`, (error as Error).stack);
      throw error;
    }
  }

  private buildTree(items: any[]): MenuTreeNode[] {
    const map = new Map<string, MenuTreeNode>();
    const roots: MenuTreeNode[] = [];

    for (const item of items) {
      map.set(item.menuKey, {
        id: item.id,
        menuKey: item.menuKey,
        label: item.label,
        labelHi: item.labelHi,
        icon: item.icon || undefined,
        route: item.route || undefined,
        moduleCode: item.moduleCode || undefined,
        verticalType: item.verticalType || undefined,
        sortOrder: item.sortOrder,
        isActive: item.isActive,
        children: [],
      });
    }

    for (const item of items) {
      const node = map.get(item.menuKey)!;
      if (item.parentKey && map.has(item.parentKey)) {
        map.get(item.parentKey)!.children.push(node);
      } else {
        roots.push(node);
      }
    }

    // Sort children at each level
    const sortChildren = (nodes: MenuTreeNode[]) => {
      nodes.sort((a, b) => a.sortOrder - b.sortOrder);
      for (const node of nodes) {
        sortChildren(node.children);
      }
    };
    sortChildren(roots);

    return roots;
  }
}
